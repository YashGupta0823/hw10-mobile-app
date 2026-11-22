import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/colors';
import { addWorkout } from '@/storage/workouts';

const MAX_EXERCISE_LENGTH = 50;
const MAX_SETS = 100;
const MAX_REPS = 1000;

type FieldErrors = {
  exercise?: string;
  sets?: string;
  reps?: string;
};

function parsePositiveInt(value: string, label: string, max: number): number | string {
  const trimmed = value.trim();
  if (trimmed === '') return `${label} is required.`;
  if (!/^\d+$/.test(trimmed)) return `${label} must be a whole number.`;
  const n = Number(trimmed);
  if (n < 1) return `${label} must be at least 1.`;
  if (n > max) return `${label} must be ${max} or less.`;
  return n;
}

export default function AddWorkoutScreen() {
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const setsRef = useRef<TextInputInstance>(null);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleSave = async () => {
    if (saving) return;

    const nextErrors: FieldErrors = {};
    const name = exercise.trim().replace(/\s+/g, ' ');
    if (name === '') {
      nextErrors.exercise = 'Exercise name is required.';
    } else if (name.length > MAX_EXERCISE_LENGTH) {
      nextErrors.exercise = `Exercise name must be ${MAX_EXERCISE_LENGTH} characters or less.`;
    }
    const parsedSets = parsePositiveInt(sets, 'Sets', MAX_SETS);
    if (typeof parsedSets === 'string') nextErrors.sets = parsedSets;
    const parsedReps = parsePositiveInt(reps, 'Reps', MAX_REPS);
    if (typeof parsedReps === 'string') nextErrors.reps = parsedReps;

    setErrors(nextErrors);
    if (
      Object.keys(nextErrors).length > 0 ||
      typeof parsedSets !== 'number' ||
      typeof parsedReps !== 'number'
    ) {
      return;
    }

    setSaving(true);
    try {
      await addWorkout({ exercise: name, sets: parsedSets, reps: parsedReps });
      goBack();
    } catch (e) {
      console.error('RepTrack: failed to save workout', e);
      Alert.alert('Could not save workout', 'Something went wrong saving your workout. Please try again.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
            onPress={goBack}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title} accessibilityRole="header">
            Add Workout
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Exercise Name</Text>
            <TextInput
              value={exercise}
              onChangeText={(text) => {
                setExercise(text);
                if (errors.exercise) setErrors((prev) => ({ ...prev, exercise: undefined }));
              }}
              placeholder="e.g. Bench Press"
              placeholderTextColor={AppColors.textMuted}
              style={[styles.input, errors.exercise && styles.inputError]}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={MAX_EXERCISE_LENGTH}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => setsRef.current?.focus()}
              accessibilityLabel="Exercise Name"
            />
            {errors.exercise ? <Text style={styles.errorText}>{errors.exercise}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.flex]}>
              <Text style={styles.label}>Sets</Text>
              <TextInput
                ref={setsRef}
                value={sets}
                onChangeText={(text) => {
                  setSets(text.replace(/[^0-9]/g, ''));
                  if (errors.sets) setErrors((prev) => ({ ...prev, sets: undefined }));
                }}
                placeholder="e.g. 3"
                placeholderTextColor={AppColors.textMuted}
                style={[styles.input, errors.sets && styles.inputError]}
                keyboardType="number-pad"
                maxLength={3}
                accessibilityLabel="Sets"
              />
              {errors.sets ? <Text style={styles.errorText}>{errors.sets}</Text> : null}
            </View>

            <View style={[styles.field, styles.flex]}>
              <Text style={styles.label}>Reps</Text>
              <TextInput
                value={reps}
                onChangeText={(text) => {
                  setReps(text.replace(/[^0-9]/g, ''));
                  if (errors.reps) setErrors((prev) => ({ ...prev, reps: undefined }));
                }}
                placeholder="e.g. 10"
                placeholderTextColor={AppColors.textMuted}
                style={[styles.input, errors.reps && styles.inputError]}
                keyboardType="number-pad"
                maxLength={4}
                accessibilityLabel="Reps"
              />
              {errors.reps ? <Text style={styles.errorText}>{errors.reps}</Text> : null}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save Workout"
            accessibilityState={{ disabled: saving, busy: saving }}
            disabled={saving}
            onPress={handleSave}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || saving) && styles.pressed,
            ]}>
            {saving ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Save Workout</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.navy,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: 'row',
  },
  backButton: {
    minHeight: 44,
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderRadius: 10,
  },
  backButtonText: {
    color: AppColors.blueLight,
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },
  title: {
    color: AppColors.white,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    color: AppColors.blueLight,
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    backgroundColor: AppColors.navyCard,
    borderWidth: 1.5,
    borderColor: AppColors.navyBorder,
    borderRadius: 14,
    minHeight: 54,
    paddingHorizontal: 16,
    color: AppColors.white,
    fontSize: 18,
  },
  inputError: {
    borderColor: AppColors.error,
  },
  errorText: {
    color: AppColors.error,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: AppColors.blue,
    borderRadius: 14,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
