import { View } from 'react-native';
import { router } from 'expo-router';
import { TabNavigation } from '~/components/TabNavigation';

interface TabItem {
  name: string;
  label: string;
  icon: string;
  route: string;
}

interface WithTabsProps {
  children: React.ReactNode;
  tabs: TabItem[];
  currentTab: string;
}

export function WithTabs({ children, tabs, currentTab }: WithTabsProps) {
  const handleTabChange = (tabName: string) => {
    const selectedTab = tabs.find((t) => t.name === tabName);
    if (selectedTab) {
      router.replace(selectedTab.route as any);
    }
  };

  const tabItems = tabs.map((t) => ({
    name: t.name,
    label: t.label,
    icon: t.icon,
  }));

  return (
    <View className="flex-1">
      <View className="flex-1">{children}</View>
      <TabNavigation tabs={tabItems} activeTab={currentTab} onTabChange={handleTabChange} />
    </View>
  );
}
