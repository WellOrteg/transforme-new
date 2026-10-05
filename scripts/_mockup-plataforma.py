"""Prepara o vídeo do mockup (notebook + celular com o painel real) para a faixa
escura da home.

O arquivo que veio do cliente tem 36 MB, 1920x1080 e fundo branco — branco que
brigaria com o navy da seção. Aqui o fundo sai por preenchimento a partir dos
cantos (não por corte de cor: dentro das telas há texto branco que precisa
ficar), os aparelhos são recortados na medida deles e o navy da seção entra por
baixo. Sai um MP4 de ~1 MB e o pôster do primeiro quadro.

Os aparelhos não se mexem no vídeo — só o conteúdo das telas rola —, então uma
máscara tirada de um quadro serve para os 520.

Uso: python scripts/_mockup-plataforma.py "correção-site (1).mp4"
"""

import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageFilter
import numpy as np

FUNDO = (0x05, 0x03, 0x2C)  # --color-navy-900, o mesmo de [data-tema="escuro"]
LARGURA_SAIDA = 1100  # ~2x a largura em que o mockup aparece na coluna da direita
QUADROS = 24  # o painel rola devagar; 30 quadros só engordariam o arquivo
CRF = 30
TOLERANCIA = 14  # o branco do vídeo oscila entre 251 e 255 por causa da compressão
SAIDA = Path("public/video")


def executar(*args: str) -> None:
    subprocess.run(args, check=True, capture_output=True)


def mascara_do_fundo(quadro: Image.Image) -> np.ndarray:
    """Preenchimento a partir das quatro bordas: só o branco contíguo à moldura
    do vídeo é fundo. O texto branco dentro das telas não encosta na borda e
    por isso sobrevive."""
    a = np.array(quadro.convert("RGB")).astype(np.int16)
    claro = (np.abs(a - 255).max(axis=2) <= TOLERANCIA)

    altura, largura = claro.shape
    fundo = np.zeros_like(claro)
    pilha = [(0, x) for x in range(largura)] + [(altura - 1, x) for x in range(largura)]
    pilha += [(y, 0) for y in range(altura)] + [(y, largura - 1) for y in range(altura)]

    # Varredura por linhas: mais rápida que empilhar pixel a pixel em Python.
    for y, x in pilha:
        if claro[y, x]:
            fundo[y, x] = True
    mudou = True
    while mudou:
        antes = fundo.sum()
        fundo[1:, :] |= fundo[:-1, :] & claro[1:, :]
        fundo[:-1, :] |= fundo[1:, :] & claro[:-1, :]
        fundo[:, 1:] |= fundo[:, :-1] & claro[:, 1:]
        fundo[:, :-1] |= fundo[:, 1:] & claro[:, :-1]
        mudou = fundo.sum() != antes
    return fundo


def main() -> None:
    origem = Path(sys.argv[1])
    SAIDA.mkdir(parents=True, exist_ok=True)
    tmp = Path("scripts/.tmp-mockup")
    tmp.mkdir(exist_ok=True)

    quadro = tmp / "quadro.png"
    caminho_mascara = tmp / "mascara.png"
    caixa = tmp / "caixa.json"

    if caminho_mascara.exists() and caixa.exists():
        c = json.loads(caixa.read_text())
        x0, y0, largura, altura = c["x"], c["y"], c["w"], c["h"]
        print(f"reaproveitando a máscara de {largura}x{altura} em ({x0},{y0})")
    else:
        executar("ffmpeg", "-v", "error", "-ss", "2", "-i", str(origem), "-frames:v", "1", "-y", str(quadro))

        aparelhos = ~mascara_do_fundo(Image.open(quadro))
        ys, xs = np.where(aparelhos)
        # Margem de 6px e dimensões pares, exigência do H.264.
        x0, x1 = max(0, xs.min() - 6), min(aparelhos.shape[1], xs.max() + 7)
        y0, y1 = max(0, ys.min() - 6), min(aparelhos.shape[0], ys.max() + 7)
        largura, altura = (x1 - x0) // 2 * 2, (y1 - y0) // 2 * 2
        print(f"aparelhos em {largura}x{altura} a partir de ({x0},{y0})")

        recorte = aparelhos[y0 : y0 + altura, x0 : x0 + largura]
        mascara = Image.fromarray((recorte * 255).astype(np.uint8), mode="L")
        # Encolher 1px come a borda antisserrilhada, que é meio branca e mancharia
        # o navy; o desfoque devolve a suavidade.
        mascara = mascara.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
        mascara.save(caminho_mascara)
        caixa.write_text(json.dumps({"x": int(x0), "y": int(y0), "w": int(largura), "h": int(altura)}))

    cor = "0x%02X%02X%02X" % FUNDO
    # A máscara entra em laço (`-loop 1`) porque só tem um quadro; sem `shortest`
    # nos dois estágios ela seguraria a saída aberta para sempre.
    filtro = (
        f"[0:v]crop={largura}:{altura}:{x0}:{y0},fps={QUADROS},format=rgba[v];"
        f"[1:v]format=gray[m];[v][m]alphamerge=shortest=1:repeatlast=0[fg];"
        f"color=c={cor}:s={largura}x{altura}[bg];"
        f"[bg][fg]overlay=shortest=1,scale={LARGURA_SAIDA}:-2,format=yuv420p[out]"
    )

    executar(
        "ffmpeg", "-v", "error", "-i", str(origem), "-loop", "1", "-i", str(caminho_mascara),
        "-filter_complex", filtro, "-map", "[out]", "-an", "-shortest",
        "-c:v", "libx264", "-crf", str(CRF), "-preset", "slow", "-movflags", "+faststart",
        "-y", str(SAIDA / "mockup-plataforma.mp4"),
    )
    # O pôster vem de 2s, não do primeiro quadro: a gravação abre na tela de
    # carregamento, roxa e vazia. Quem pediu menos movimento vê só o pôster, e
    # ele precisa mostrar o painel.
    executar(
        "ffmpeg", "-v", "error", "-ss", "2", "-i", str(SAIDA / "mockup-plataforma.mp4"),
        "-frames:v", "1", "-c:v", "libwebp", "-quality", "72",
        "-y", str(SAIDA / "mockup-plataforma-capa.webp"),
    )

    for arquivo in sorted(SAIDA.iterdir()):
        print(f"{arquivo.name}: {arquivo.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
