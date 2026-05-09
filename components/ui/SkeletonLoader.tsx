import React, { useRef, useEffect, ReactNode } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { Radius } from '../../constants/theme';

// ─── Shimmer hook ─────────────────────────────────────────────────────────────
export function useShimmer(active = true) {
  const anim = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active]);
  return anim;
}

// ─── Primitives ───────────────────────────────────────────────────────────────
interface SkelProps { style?: ViewStyle; opacity: Animated.Value }

export function SkelBar({ style, opacity }: SkelProps) {
  return (
    <Animated.View
      style={[{ backgroundColor: '#DEDEDE', borderRadius: 6, height: 12 }, style, { opacity }]}
    />
  );
}

export function SkelBlock({ style, opacity }: SkelProps) {
  return (
    <Animated.View
      style={[{ backgroundColor: '#E8E8E8', borderRadius: Radius.md }, style, { opacity }]}
    />
  );
}

export function SkelCircle({ size = 36, opacity }: { size?: number; opacity: Animated.Value }) {
  return (
    <Animated.View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#DEDEDE', opacity }}
    />
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function SkelCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{
      backgroundColor: '#fff', borderRadius: Radius.lg,
      borderWidth: 1, borderColor: '#F0F0F0',
      padding: 16, marginBottom: 14,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    }, style]}>
      {children}
    </View>
  );
}

// ─── Notice card skeleton (matches the big notice card on dashboard) ───────────
export function NoticeCardSkeleton({ opacity }: { opacity: Animated.Value }) {
  return (
    <SkelCard>
      {/* badge + button row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
        <SkelBar style={{ width: 80, height: 22, borderRadius: 12 }} opacity={opacity} />
        <SkelBar style={{ width: 100, height: 28, borderRadius: 20 }} opacity={opacity} />
      </View>
      {/* title */}
      <SkelBar style={{ width: '70%', height: 16, marginBottom: 10 }} opacity={opacity} />
      {/* description lines */}
      <SkelBar style={{ width: '100%', height: 12, marginBottom: 8 }} opacity={opacity} />
      <SkelBar style={{ width: '85%', height: 12, marginBottom: 8 }} opacity={opacity} />
      <SkelBar style={{ width: '60%', height: 12, marginBottom: 18 }} opacity={opacity} />
      {/* divider */}
      <View style={{ height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 }} />
      {/* author + pagination row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <SkelBar style={{ width: 70, height: 13, marginBottom: 6 }} opacity={opacity} />
          <SkelBar style={{ width: 110, height: 10 }} opacity={opacity} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SkelBlock style={{ width: 36, height: 36 }} opacity={opacity} />
          <SkelBlock style={{ width: 72, height: 36 }} opacity={opacity} />
        </View>
      </View>
    </SkelCard>
  );
}

// ─── Exam card skeleton (left: text+badges, right: date box) ──────────────────
export function ExamCardSkeleton({ opacity }: { opacity: Animated.Value }) {
  return (
    <SkelCard>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <SkelBar style={{ width: '65%', height: 15, marginBottom: 10 }} opacity={opacity} />
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
            <SkelBar style={{ width: 70, height: 22, borderRadius: 12 }} opacity={opacity} />
            <SkelBar style={{ width: 60, height: 22, borderRadius: 12 }} opacity={opacity} />
            <SkelBar style={{ width: 75, height: 22, borderRadius: 12 }} opacity={opacity} />
          </View>
          <SkelBar style={{ width: '90%', height: 11, marginBottom: 6 }} opacity={opacity} />
          <SkelBar style={{ width: '70%', height: 11 }} opacity={opacity} />
        </View>
        {/* date box */}
        <SkelBlock style={{ width: 52, height: 58, borderRadius: Radius.md }} opacity={opacity} />
      </View>
    </SkelCard>
  );
}

// ─── Assignment card skeleton ─────────────────────────────────────────────────
export function AssignmentCardSkeleton({ opacity }: { opacity: Animated.Value }) {
  return (
    <SkelCard>
      {/* header: subject + status badge */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <SkelBar style={{ width: '45%', height: 12 }} opacity={opacity} />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <SkelBar style={{ width: 60, height: 24, borderRadius: 12 }} opacity={opacity} />
          <SkelBar style={{ width: 70, height: 24, borderRadius: 20 }} opacity={opacity} />
        </View>
      </View>
      {/* title */}
      <SkelBar style={{ width: '75%', height: 15, marginBottom: 8 }} opacity={opacity} />
      {/* description */}
      <SkelBar style={{ width: '100%', height: 11, marginBottom: 6 }} opacity={opacity} />
      <SkelBar style={{ width: '80%', height: 11, marginBottom: 14 }} opacity={opacity} />
      {/* divider */}
      <View style={{ height: 1, backgroundColor: '#F0F0F0', marginBottom: 10 }} />
      {/* dates + submit toggle */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 6 }}>
          <SkelBar style={{ width: 110, height: 10 }} opacity={opacity} />
          <SkelBar style={{ width: 110, height: 10 }} opacity={opacity} />
        </View>
        <SkelBar style={{ width: 120, height: 32, borderRadius: Radius.sm }} opacity={opacity} />
      </View>
    </SkelCard>
  );
}

// ─── Result (class test / mid-term) card skeleton ─────────────────────────────
export function ResultCardSkeleton({ opacity }: { opacity: Animated.Value }) {
  return (
    <SkelCard>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <SkelBar style={{ width: '65%', height: 15, marginBottom: 10 }} opacity={opacity} />
          <SkelBar style={{ width: 70, height: 22, borderRadius: 12, marginBottom: 10 }} opacity={opacity} />
          {/* progress bar */}
          <SkelBlock style={{ width: '100%', height: 5, borderRadius: 3, marginBottom: 8 }} opacity={opacity} />
          <SkelBar style={{ width: 80, height: 11 }} opacity={opacity} />
        </View>
        {/* score box */}
        <SkelBlock style={{ width: 60, height: 70, borderRadius: Radius.md }} opacity={opacity} />
      </View>
    </SkelCard>
  );
}

// ─── Board CGPA summary skeleton ──────────────────────────────────────────────
export function BoardSummarySkeleton({ opacity }: { opacity: Animated.Value }) {
  return (
    <View>
      {/* top banner */}
      <SkelBlock style={{ height: 56, marginBottom: 20, marginTop: 8 }} opacity={opacity} />
      {/* CGPA card */}
      <SkelCard style={{ padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <SkelBar style={{ width: 80, height: 50, borderRadius: Radius.md, marginBottom: 8 }} opacity={opacity} />
          <SkelBar style={{ width: 60, height: 12 }} opacity={opacity} />
        </View>
        <SkelBlock style={{ width: '100%', height: 8, borderRadius: 4 }} opacity={opacity} />
      </SkelCard>
      {/* semester cards */}
      {[1, 2, 3].map(i => (
        <SkelCard key={i} style={{ padding: 0, overflow: 'hidden' }}>
          {/* header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#F7F7F7' }}>
            <SkelBar style={{ width: 120, height: 16 }} opacity={opacity} />
            <SkelBar style={{ width: 80, height: 24, borderRadius: 12 }} opacity={opacity} />
          </View>
          {/* body */}
          <View style={{ padding: 16 }}>
            <SkelBlock style={{ width: '100%', height: 44, borderRadius: Radius.md, marginBottom: 12 }} opacity={opacity} />
            <SkelBar style={{ width: '60%', height: 12 }} opacity={opacity} />
          </View>
        </SkelCard>
      ))}
    </View>
  );
}

// ─── Dashboard summary card skeletons (3 stat cards) ─────────────────────────
export function DashboardSummarySkeleton({ opacity }: { opacity: Animated.Value }) {
  return (
    <View style={{ gap: 8, marginBottom: 12 }}>
      {[1, 2, 3].map(i => (
        <SkelCard key={i} style={{ marginBottom: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <SkelCircle size={46} opacity={opacity} />
            <View style={{ flex: 1, gap: 8 }}>
              <SkelBar style={{ width: '60%', height: 14 }} opacity={opacity} />
              <SkelBar style={{ width: '40%', height: 11 }} opacity={opacity} />
            </View>
            <SkelBar style={{ width: 32, height: 32, borderRadius: Radius.sm }} opacity={opacity} />
          </View>
        </SkelCard>
      ))}
    </View>
  );
}
