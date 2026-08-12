import { TextInput, Text, View } from 'react-native';

interface InputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  error?: string;
  multiline?: boolean;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  error,
  multiline,
}: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-textSecondary mb-1 text-xs font-medium">{label}</Text>}
      <TextInput
        className={`border ${error ? 'border-error' : 'border-border'} text-textPrimary rounded-lg bg-white px-3 py-2.5 text-sm`}
        placeholder={placeholder}
        placeholderTextColor="#9E9E9E"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
      />
      {error && <Text className="text-error mt-1 text-xs">{error}</Text>}
    </View>
  );
}
