import { View, TouchableOpacity, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface TabItem {
  name: string;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <View className="flex-row border-t border-stone-200 bg-white px-2 py-2 dark:border-stone-800 dark:bg-stone-900">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => onTabChange(tab.name)}
            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg px-1 py-2.5 ${
              isActive ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-transparent dark:bg-transparent'
            }`}
            activeOpacity={0.7}>
            <Ionicons name={tab.icon as any} size={18} color={isActive ? '#b45309' : '#78716c'} />
            <Text
              className={`text-xs font-semibold ${
                isActive
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
              numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
