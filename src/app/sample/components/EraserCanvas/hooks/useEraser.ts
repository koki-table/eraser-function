import { useState, useRef, useCallback } from "react";
import Konva from "konva";

// モード定数
export const EraserMode = {
  Delete: "delete",
  Restore: "restore",
} as const;

export type EraserModeType = (typeof EraserMode)[keyof typeof EraserMode];

interface EraserState {
  isDrawing: boolean;
  currentMode: EraserModeType;
  restoreLines: LineData[]; // 復元用の線
  deleteLines: LineData[]; // 削除・復元統合管理用の線
  clipMaskEraseLines: LineData[]; // 削除時にクリッピングマスクを消すための線
}

interface LineData {
  points: number[];
  globalCompositeOperation: "source-over" | "destination-out";
  stroke: string;
  strokeWidth: number;
  type: "restore" | "delete" | "clipMaskErase";
}

export const useEraser = () => {
  // 消しゴム機能の状態管理
  const [state, setState] = useState<EraserState>({
    isDrawing: false,
    currentMode: EraserMode.Delete, // デフォルトは削除モード
    restoreLines: [], // 復元時に描画する線（オリジナル画像をマスク表示用）
    deleteLines: [], // 削除・復元統合管理用の線
    clipMaskEraseLines: [], // 削除時にクリッピングマスクを消すための線
  });

  console.log(state);
  

  const stageRef = useRef<Konva.Stage>(null);
  const isDrawing = useRef(false);
  const lastLine = useRef<any>(null);

  // 削除モード ⇔ 復元モードの切り替え
  const toggleEraserMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentMode:
        prev.currentMode === EraserMode.Delete
          ? EraserMode.Restore
          : EraserMode.Delete,
    }));
  }, []);

  // 全ての描画をリセット
  const resetCanvas = useCallback(() => {
    setState((prev) => ({
      ...prev,
      restoreLines: [],
      deleteLines: [],
      clipMaskEraseLines: [],
    }));
  }, []);

  // マウス押下時：新しい線の開始
  const handleMouseDown = useCallback(
    (e: any) => {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();

      // ヘルパー関数: 線オブジェクト生成
      const createLine = (
        stroke: string,
        operation: "source-over" | "destination-out",
        type: string
      ): LineData => ({
        points: [pos.x, pos.y],
        globalCompositeOperation: operation,
        stroke,
        strokeWidth: 20,
        type: type as LineData["type"],
      });

      // 復元モードの処理
      if (state.currentMode === EraserMode.Restore) {
        const mainLine = createLine("#000000", "source-over", "restore");
        const deleteLine = createLine(
          "#ffffff",
          "destination-out",
          "delete"
        );

        lastLine.current = mainLine;
        setState((prev) => ({
          ...prev,
          restoreLines: [...prev.restoreLines, mainLine],
          deleteLines: [...prev.deleteLines, deleteLine],
        }));
        return;
      }

      // 削除モードの処理
      const mainLine = createLine("#ffffff", "source-over", "delete");
      const eraseLine = createLine(
        "#000000",
        "destination-out",
        "clipMaskErase"
      );

      lastLine.current = mainLine;
      setState((prev) => ({
        ...prev,
        deleteLines: [...prev.deleteLines, mainLine],
        clipMaskEraseLines: [...prev.clipMaskEraseLines, eraseLine],
      }));
    },
    [state.currentMode]
  );

  // マウス移動時：線の継続描画
  const handleMouseMove = useCallback(
    (e: any) => {
      if (!isDrawing.current) return;

      // ヘルパー関数: 配列の最後の線にポイントを追加
      const addPointToLastLine = (lines: LineData[]) => {
        const point = e.target.getStage().getPointerPosition();
        if (lines.length === 0) return lines;
        const lastIndex = lines.length - 1;
        return lines.map((line, index) =>
          index === lastIndex
            ? { ...line, points: [...line.points, point.x, point.y] }
            : line
        );
      };

      setState((prev) => {
        // 復元モード：復元線と削除線を更新
        if (state.currentMode === EraserMode.Restore) {
          if (prev.restoreLines.length === 0) return prev;

          return {
            ...prev,
            restoreLines: addPointToLastLine(prev.restoreLines),
            deleteLines: addPointToLastLine(prev.deleteLines),
            // 参照を更新して再レンダリングを強制
            clipMaskEraseLines: [...prev.clipMaskEraseLines]
          };
        }

        // 削除モード：削除線とクリッピングマスク消去線を更新
        if (state.currentMode === EraserMode.Delete) {
          if (prev.deleteLines.length === 0) return prev;

          return {
            ...prev,
            deleteLines: addPointToLastLine(prev.deleteLines),
            clipMaskEraseLines: addPointToLastLine(prev.clipMaskEraseLines),
          };
        }

        return prev;
      });
    },
    [state.currentMode]
  );

  // マウス離上時：描画終了
  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

  // 現在のキャンバス状態を画像として保存
  const saveImage = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;

    return stage.toDataURL({ pixelRatio: 2 }); // 高解像度で出力
  }, []);

  return {
    ...state,
    stageRef,
    toggleEraserMode,
    resetCanvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    saveImage,
  };
};
