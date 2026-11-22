import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/colors';
import { loadWorkouts, StoredWorkoutsError } from '@/storage/workouts';
import type { Workout } from '@/types/workout';

function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${day} · ${time}`;
}

function WorkoutCard({ workout }: { workout: Workout }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {workout.exercise}
      </Text>
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>{workout.sets}</Text>
          <Text style={styles.statLabel}>{workout.sets === 1 ? 'set' : 'sets'}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>{workout.reps}</Text>
          <Text style={styles.statLabel}>{workout.reps === 1 ? 'rep' : 'reps'}</Text>
        </View>
      </View>
      <Text style={styles.cardDate}>{formatDate(workout.date)}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await loadWorkouts();
      setWorkouts(data);
      setError(null);
    } catch (e) {
      console.error('RepTrack: failed to load workouts', e);
      setError(
        e instanceof StoredWorkoutsError
          ? 'Your saved workout data appears to be damaged and could not be read. ' +
              'To protect it, RepTrack will not save new workouts until this is resolved.'
          : 'Could not load your workouts. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Prevents a rapid double tap from pushing the Add screen twice.
  const navigatingRef = useRef(false);

  // Reload whenever the screen gains focus (e.g. after saving a workout).
  useFocusEffect(
    useCallback(() => {
      navigatingRef.current = false;
      refresh();
    }, [refresh])
  );

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={AppColors.blueLight} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setLoading(true);
              refresh();
            }}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WorkoutCard workout={item} />}
        contentContainerStyle={[styles.listContent, workouts.length === 0 && styles.listEmpty]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>No workouts yet.</Text>
            <Text style={styles.emptyText}>Log your first workout!</Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.appName} accessibilityRole="header">
          RepTrack
        </Text>
        <Text style={styles.subtitle}>Workout History</Text>
      </View>

      <View style={styles.body}>{renderBody()}</View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add Workout"
          onPress={() => {
            if (navigatingRef.current) return;
            navigatingRef.current = true;
            router.push('/add');
          }}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>+ Add Workout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.navy,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  appName: {
    color: AppColors.white,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: AppColors.blueLight,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 4,
  },
  body: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listEmpty: {
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: AppColors.navyCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.navyBorder,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    backgroundColor: AppColors.navy,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  statValue: {
    color: AppColors.blueLight,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: AppColors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  cardDate: {
    color: AppColors.textMuted,
    fontSize: 14,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: AppColors.blueLight,
    fontSize: 17,
    textAlign: 'center',
  },
  errorText: {
    color: AppColors.error,
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AppColors.navyBorder,
  },
  primaryButton: {
    backgroundColor: AppColors.blue,
    borderRadius: 14,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: AppColors.blue,
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: AppColors.blueLight,
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
