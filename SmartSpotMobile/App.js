import { useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import UserLoginScreen from "./src/screens/UserLoginScreen";
import ParkingDashboardScreen from "./src/screens/ParkingDashboardScreen";
import SettingsPageScreen from "./src/screens/SettingsPageScreen";
import { palette } from "./src/theme/palette";

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.panel,
    text: palette.textPrimary,
    primary: palette.action,
    border: palette.border,
  },
};

export default function App() {
  const [session, setSession] = useState(null);
  const [settings, setSettings] = useState({
    supervisorName: "Edmarkzel",
    alertThreshold: 85,
    refreshInterval: 30,
    notificationsEnabled: true,
    darkMode: false,
  });

  function handleLoginSuccess(mode = "admin", profile = {}) {
    setSession({
      token: `mobile-session-${Date.now()}`,
      createdAt: Date.now(),
      mode,
      profile,
    });
  }

  function handleLogout() {
    setSession(null);
  }

  function handleSettingsSave(updatedSettings) {
    setSettings(updatedSettings);
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="UserLogin"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        {!session ? (
          <Stack.Screen name="UserLogin">
            {(props) => (
              <UserLoginScreen
                {...props}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="ParkingDashboard">
              {(props) => (
                <ParkingDashboardScreen
                  {...props}
                  onLogout={handleLogout}
                  session={session}
                  settings={settings}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SettingsPage">
              {(props) => (
                <SettingsPageScreen
                  {...props}
                  onLogout={handleLogout}
                  onSave={handleSettingsSave}
                  session={session}
                  settings={settings}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
