import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ContactsScreen from '../screens/ContactsScreen';
import AddContactScreen from '../screens/AddContactScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { TabBarIcon } from '../components/TabBarIcon';

// ===================== 类型定义 =====================
export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Profile: undefined;
};

export type ContactsStackParamList = {
  ContactsList: undefined;
  AddContact: { contact?: any } | undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
};

// ===================== 导航器 =====================
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ContactsStack = createNativeStackNavigator<ContactsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function ContactsStackNavigator() {
  return (
    <ContactsStack.Navigator screenOptions={{ headerShown: false }}>
      <ContactsStack.Screen name="ContactsList" component={ContactsScreen} />
      <ContactsStack.Screen name="AddContact" component={AddContactScreen} />
    </ContactsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTer,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '签到',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="check-circle" color={color} size={size} />
          ),
        }}
      />
      <MainTab.Screen
        name="Contacts"
        component={ContactsStackNavigator}
        options={{
          tabBarLabel: '联系人',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="people" color={color} size={size} />
          ),
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="person" color={color} size={size} />
          ),
        }}
      />
    </MainTab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {(isAuthenticated || isGuest) ? (
        <MainTabs />
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
