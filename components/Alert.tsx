// components/Alert.tsx
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title: string;
  description?: string;
  onClose?: () => void;
  showIcon?: boolean;
  visible?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const alertConfig: Record<AlertVariant, {
  container: string;
  iconContainer: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  titleColor: string;
  descriptionColor: string;
  borderColor: string;
  shadowColor: string;
  buttonColor: string;
}> = {
  success: {
    container: 'bg-emerald-50 dark:bg-emerald-950/90',
    iconContainer: 'bg-emerald-100 dark:bg-emerald-900/50',
    icon: 'checkmark-circle',
    iconColor: '#059669',
    titleColor: 'text-emerald-800 dark:text-emerald-400',
    descriptionColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-900/50',
    shadowColor: '#059669',
    buttonColor: 'bg-emerald-600',
  },
  error: {
    container: 'bg-red-50 dark:bg-red-950/90',
    iconContainer: 'bg-red-100 dark:bg-red-900/50',
    icon: 'alert-circle',
    iconColor: '#dc2626',
    titleColor: 'text-red-800 dark:text-red-400',
    descriptionColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-900/50',
    shadowColor: '#dc2626',
    buttonColor: 'bg-red-600',
  },
  warning: {
    container: 'bg-amber-50 dark:bg-amber-950/90',
    iconContainer: 'bg-amber-100 dark:bg-amber-900/50',
    icon: 'warning',
    iconColor: '#d97706',
    titleColor: 'text-amber-800 dark:text-amber-400',
    descriptionColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-900/50',
    shadowColor: '#d97706',
    buttonColor: 'bg-amber-600',
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-950/90',
    iconContainer: 'bg-blue-100 dark:bg-blue-900/50',
    icon: 'information-circle',
    iconColor: '#2563eb',
    titleColor: 'text-blue-800 dark:text-blue-400',
    descriptionColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-900/50',
    shadowColor: '#2563eb',
    buttonColor: 'bg-blue-600',
  },
};

export function Alert({
  variant = 'info',
  title,
  description,
  onClose,
  showIcon = true,
  visible = true,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Batal',
  showCancel = false,
}: AlertProps) {
  const config = alertConfig[variant];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView
          intensity={80}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        
        <View
          className={`relative w-[85%] max-w-sm rounded-2xl border-2 p-5 ${config.container} ${config.borderColor}`}
          style={{
            shadowColor: config.shadowColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 10,
          }}>
          
          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-3 top-3 z-10"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={20} color={config.iconColor} />
            </TouchableOpacity>
          )}

          <View className="items-center">
            {showIcon && (
              <View className={`mb-3 h-14 w-14 items-center justify-center rounded-full ${config.iconContainer}`}>
                <Ionicons name={config.icon} size={28} color={config.iconColor} />
              </View>
            )}

            <Text className={`text-center text-base font-bold ${config.titleColor}`}>
              {title}
            </Text>

            {description && (
              <Text className={`mt-2 text-center text-sm leading-5 ${config.descriptionColor}`}>
                {description}
              </Text>
            )}

            {/* Buttons */}
            {(onConfirm || showCancel) && (
              <View className="mt-5 flex-row gap-3">
                {showCancel && (
                  <TouchableOpacity
                    onPress={onClose}
                    className="flex-1 rounded-xl border border-stone-300 bg-white py-2.5 dark:border-stone-600 dark:bg-stone-800"
                    activeOpacity={0.7}>
                    <Text className="text-center text-sm font-semibold text-stone-600 dark:text-stone-300">
                      {cancelText}
                    </Text>
                  </TouchableOpacity>
                )}
                {onConfirm && (
                  <TouchableOpacity
                    onPress={onConfirm}
                    className={`flex-1 rounded-xl py-2.5 ${config.buttonColor}`}
                    activeOpacity={0.7}>
                    <Text className="text-center text-sm font-semibold text-white">
                      {confirmText}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});