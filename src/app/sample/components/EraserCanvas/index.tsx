import { useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Line } from "react-konva";
import { Box } from "@mui/material";
import { useEraser, EraserMode } from "./hooks/useEraser";
import Controls from "../Controls";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function EraserCanvas() {
  // 消しゴム機能の状態とイベントハンドラを取得
  const {
    currentMode, // 現在のモード（EraserMode.Delete | EraserMode.Restore）
    clipMaskLines, // クリッピングマスク統合管理用の線データ配列
    deleteLines, // 削除・復元統合管理用の線データ配列
    stageRef,
    toggleEraserMode,
    resetCanvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    saveImage,
  } = useEraser();

  // 画像リファレンスを管理
  const backgroundImageRef = useRef<HTMLImageElement | null>(null); // オリジナル画像（復元時に表示）
  const foregroundImageRef = useRef<HTMLImageElement | null>(null); // 背景削除済み画像（メイン表示）

  // コンポーネントマウント時に画像を読み込み
  useEffect(() => {
    const loadImages = async () => {
      // オリジナル画像の読み込み（復元時に使用）
      const bgImg = new window.Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.onload = () => {
        backgroundImageRef.current = bgImg;
      };
      bgImg.src = "/sample.webp";

      // 背景削除済み画像の読み込み（メイン表示用）
      const fgImg = new window.Image();
      fgImg.crossOrigin = "anonymous";
      fgImg.onload = () => {
        foregroundImageRef.current = fgImg;
      };
      fgImg.src = "/sampleBgRemovedLayer.png";
    };

    loadImages();
  }, []);

  return (
    <Box>
      <Controls
        currentMode={currentMode}
        onToggleEraser={toggleEraserMode}
        onReset={resetCanvas}
        onSave={saveImage}
      />

      <Box
        sx={{
          border: 1,
          borderColor: "grey.300",
          borderRadius: 1,
          display: "inline-block",
          mt: 2,
        }}
      >
        <Stage
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown} // 描画開始イベント
          onMousemove={handleMouseMove} // 描画継続イベント
          onMouseup={handleMouseUp} // 描画終了イベント
          ref={stageRef}
        >
          {/* クリッピングマスクレイヤー: マスクの部分のみオリジナル画像を表示 */}
          <Layer>
            {/* クリッピングマスク用のライン */}
            {clipMaskLines.map((line, i) => (
              <Line
                key={`clipMask-${i}`}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={line.globalCompositeOperation}
              />
            ))}
            {/* クリッピングマスクラインがある場合のみ、その形状でオリジナル画像をクリッピング表示 */}
            {backgroundImageRef.current && clipMaskLines.length > 0 && (
              <KonvaImage
                image={backgroundImageRef.current}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                globalCompositeOperation="source-in" // 上の線の形状でマスク
              />
            )}
          </Layer>

          {/* 背景画像レイヤー（最下位） */}
          <Layer>
            {foregroundImageRef.current && (
              <KonvaImage
                image={foregroundImageRef.current}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />
            )}
          </Layer>

          {/* 削除レイヤー（白いライン） */}
          <Layer>
            {deleteLines.map((line, i) => (
              <Line
                key={`unified-${i}`}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={line.globalCompositeOperation}
              />
            ))}
          </Layer>
        </Stage>
      </Box>
    </Box>
  );
}
