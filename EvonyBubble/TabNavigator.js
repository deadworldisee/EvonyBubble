import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from './screens/HomeScreen';
import UserScreen from './screens/UserScreen'; // Placeholder for actual User screen
import InfoScreen from './screens/InfoScreen'; // Placeholder for actual Info screen

const Tab = createBottomTabNavigator();

const TabNavigator = ({ onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'UserTab') {
            iconName = 'user';
          } else if (route.name === 'InfoTab') {
            iconName = 'info';
          }

          return <Icon name={iconName} size={30} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: 'rgba(255, 165, 0, 0.8)',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 0, 0, 1)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60, // Adjust height as needed
        },
        headerShown: false, // Hides the header
      })}
    >
      <Tab.Screen name="HomeTab">
        {(props) => <HomeScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="UserTab">
        {(props) => <UserScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="InfoTab" component={InfoScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
