interface TextDrawOptions {
    fontSize: number;
    fontColor: string;
    fontFamilly?: string;
    maxLines: number;
    autoEllipsis: boolean;
    startX: number;
    startY: number;
    lineHeight: number;
    lineWidth: number;
}

export function autoNewlineDrawText(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, str: string, drawOptions: TextDrawOptions) {
    const { fontSize, fontColor, maxLines, autoEllipsis, startX, startY, lineHeight, lineWidth } = drawOptions
    ctx.save();
    ctx.font = `${fontSize}px`;
    ctx.fillStyle = fontColor;
    ctx.textBaseline = 'top';

    const metrics = ctx.measureText(str);
    const totalWidth = metrics.width;

    let pendingLine = 0;
    if (totalWidth < lineWidth) {
        ctx.fillText(str, startX, startY);
    } else {

        let startIndex = 1;
        let endIndex = 3;

        while (endIndex <= str.length) {

            if (ctx.measureText(str.substring(startIndex, endIndex)).width < lineWidth) {
                endIndex++;
            } else {
                if (pendingLine === maxLines - 1) {
                    let drawText = `${autoEllipsis ? str.substring(startIndex, endIndex - 4) + '...' :
                        str.substring(startIndex, endIndex - 1)}`
                    ctx.fillText(
                        drawText,
                        startX,
                        startY + lineHeight * pendingLine
                    );
                    ctx.restore();
                    return
                } else {
                    ctx.fillText(
                        str.substring(startIndex, endIndex - 1),
                        startX,
                        startY + lineHeight * pendingLine
                    );
                }

                pendingLine++;
                startIndex = endIndex - 1;
                endIndex = startIndex + 2;
            }
        }

        if (startIndex <= str.length - 1)
            ctx.fillText(
                str.substring(startIndex,),
                startX,
                startY + lineHeight * pendingLine
            );
    }


    ctx.restore();
}