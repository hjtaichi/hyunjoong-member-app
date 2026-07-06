import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_BASE_URL } from "../../config/env";
import {
  DEFAULT_GONGBEOP_GOALS,
  GONGBEOP_LABELS,
} from "./gongbeopMeta";

export function useGongbeopRecords({
  token,
  setGoalModalVisible,
  setCompletedGoalNames,
  setCompletionModalType,
  setCompletionModalVisible,
}) {
  const [gongbeopUpdatedAt, setGongbeopUpdatedAt] = useState(null);

  const [gongbeopRecord, setGongbeopRecord] = useState({
    ilsimyangui: "",
    yobujeonsa: "",
    duyoMinutes: "",
    ohaengjeonsa: "",
  });

  const [todayGongbeopRecord, setTodayGongbeopRecord] = useState({
    ilsimyangui: "",
    yobujeonsa: "",
    duyoMinutes: "",
    ohaengjeonsa: "",
  });

  const [gongbeopGoals, setGongbeopGoals] = useState(DEFAULT_GONGBEOP_GOALS);
  const [gongbeopGoalRows, setGongbeopGoalRows] = useState([]);

  const loadGongbeopRecord = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/api/member/me/gongbeop?t=${Date.now()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message);

    const record = result.data;

    setGongbeopRecord({
      ilsimyangui: record?.ilsimyangui ? String(record.ilsimyangui) : "",
      yobujeonsa: record?.yobujeonsa ? String(record.yobujeonsa) : "",
      duyoMinutes: record?.duyoMinutes ? String(record.duyoMinutes) : "",
      ohaengjeonsa: record?.ohaengjeonsa ? String(record.ohaengjeonsa) : "",
    });

    setGongbeopUpdatedAt(record?.updatedAt || null);
  }, [token]);

  const loadGongbeopGoals = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/api/member/me/gongbeop-goals?t=${Date.now()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "공력 목표 불러오기 실패");

    const activeGoals = result.data?.activeGoals || [];

    setGongbeopGoalRows(activeGoals);

    setGongbeopGoals((prev) => ({
      ...prev,
      ilsimyangui:
        activeGoals.find((item) => item.type === "ilsimyangui")?.target?.toString() ||
        prev.ilsimyangui,
      yobujeonsa:
        activeGoals.find((item) => item.type === "yobujeonsa")?.target?.toString() ||
        prev.yobujeonsa,
      duyoMinutes:
        activeGoals.find((item) => item.type === "duyoMinutes")?.target?.toString() ||
        prev.duyoMinutes,
      ohaengjeonsa:
        activeGoals.find((item) => item.type === "ohaengjeonsa")?.target?.toString() ||
        prev.ohaengjeonsa,
    }));
  }, [token]);

  const handleChangeGongbeopGoal = useCallback((key, value) => {
    const numericOnly = value.replace(/[^0-9]/g, "");

    const limitedValue = numericOnly
      ? String(Math.min(Number(numericOnly), 9999999))
      : "";

    setGongbeopGoals((prev) => ({
      ...prev,
      [key]: limitedValue,
    }));
  }, []);

  const handleChangeTodayGongbeop = useCallback((key, value) => {
    const numericOnly = value.replace(/[^0-9]/g, "");

    setTodayGongbeopRecord((prev) => ({
      ...prev,
      [key]: numericOnly,
    }));
  }, []);

  const handleSaveGongbeopRecord = useCallback(async () => {
    try {
      const nextGongbeopRecord = {
        ilsimyangui:
          todayGongbeopRecord.ilsimyangui !== ""
            ? String(Number(todayGongbeopRecord.ilsimyangui || 0))
            : String(Number(gongbeopRecord.ilsimyangui || 0)),

        yobujeonsa:
          todayGongbeopRecord.yobujeonsa !== ""
            ? String(Number(todayGongbeopRecord.yobujeonsa || 0))
            : String(Number(gongbeopRecord.yobujeonsa || 0)),

        duyoMinutes:
          todayGongbeopRecord.duyoMinutes !== ""
            ? String(Number(todayGongbeopRecord.duyoMinutes || 0))
            : String(Number(gongbeopRecord.duyoMinutes || 0)),

        ohaengjeonsa:
          todayGongbeopRecord.ohaengjeonsa !== ""
            ? String(Number(todayGongbeopRecord.ohaengjeonsa || 0))
            : String(Number(gongbeopRecord.ohaengjeonsa || 0)),
      };

      const response = await fetch(`${API_BASE_URL}/api/member/me/gongbeop`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          ilsimyangui: Number(nextGongbeopRecord.ilsimyangui || 0),
          yobujeonsa: Number(nextGongbeopRecord.yobujeonsa || 0),
          duyoMinutes: Number(nextGongbeopRecord.duyoMinutes || 0),
          ohaengjeonsa: Number(nextGongbeopRecord.ohaengjeonsa || 0),
          note: "",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "공법 기록 저장 실패");
      }

      const progressEntries = [
        ["ilsimyangui", Number(nextGongbeopRecord.ilsimyangui || 0)],
        ["yobujeonsa", Number(nextGongbeopRecord.yobujeonsa || 0)],
        ["duyoMinutes", Number(nextGongbeopRecord.duyoMinutes || 0)],
        ["ohaengjeonsa", Number(nextGongbeopRecord.ohaengjeonsa || 0)],
      ];

      const activeGoalTypes = new Set(
        gongbeopGoalRows.map((item) => String(item.type))
      );

      const progressTargets = progressEntries.filter(([type]) =>
        activeGoalTypes.has(type)
      );

      const progressResults = await Promise.all(
        progressTargets.map(async ([type, current]) => {
          const progressResponse = await fetch(
            `${API_BASE_URL}/api/member/me/gongbeop-goals/${type}/progress`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
              },
              body: JSON.stringify({ current }),
            }
          );

          const progressResult = await progressResponse.json();

          if (!progressResponse.ok) {
            throw new Error(progressResult.message || "공력 목표 진행률 저장 실패");
          }

          return {
            type,
            result: progressResult,
          };
        })
      );

      const completedNames = progressResults
        .filter((item) => item.result?.data?.status === "completed")
        .map((item) => GONGBEOP_LABELS[item.type])
        .filter(Boolean);

      setGongbeopRecord(nextGongbeopRecord);

      setTodayGongbeopRecord({
        ilsimyangui: "",
        yobujeonsa: "",
        duyoMinutes: "",
        ohaengjeonsa: "",
      });

      await loadGongbeopGoals();

      if (completedNames.length > 0) {
        setCompletedGoalNames(completedNames);
        setCompletionModalType("gongbeop");

        setTimeout(() => {
          setCompletionModalVisible(true);
        }, 300);
      }
    } catch (error) {
      Alert.alert(
        "오류",
        error.message || "공법 기록 저장 중 오류가 발생했습니다."
      );
    }
  }, [
    token,
    gongbeopRecord,
    todayGongbeopRecord,
    gongbeopGoalRows,
    loadGongbeopGoals,
    setCompletedGoalNames,
    setCompletionModalType,
    setCompletionModalVisible,
  ]);

  const handleSaveGongbeopGoals = useCallback(async () => {
    const entries = [
      ["ilsimyangui", gongbeopGoals.ilsimyangui],
      ["yobujeonsa", gongbeopGoals.yobujeonsa],
      ["duyoMinutes", gongbeopGoals.duyoMinutes],
      ["ohaengjeonsa", gongbeopGoals.ohaengjeonsa],
    ].filter(([, target]) => target && Number(target) > 0);

    try {
      setGoalModalVisible(false);

      for (const [type, target] of entries) {
        const response = await fetch(`${API_BASE_URL}/api/member/me/gongbeop-goals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            type,
            target: Number(target),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "공력 목표 저장 실패");
        }
      }

      await loadGongbeopGoals();

      Alert.alert("완료", "공력 목표가 저장되었습니다.");
    } catch (error) {
      Alert.alert("오류", error.message || "공력 목표 저장 중 오류가 발생했습니다.");
    }
  }, [gongbeopGoals, token, loadGongbeopGoals, setGoalModalVisible]);

  return {
    gongbeopRecord,
    todayGongbeopRecord,
    setTodayGongbeopRecord,
    gongbeopGoals,
    gongbeopGoalRows,
    gongbeopUpdatedAt,
    loadGongbeopRecord,
    loadGongbeopGoals,
    handleChangeGongbeopGoal,
    handleChangeTodayGongbeop,
    handleSaveGongbeopRecord,
    handleSaveGongbeopGoals,
  };
}