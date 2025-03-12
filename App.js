import React from 'react';
import {enableScreens} from 'react-native-screens';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import AddRecipeScreen from './src/screens/AddRecipeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

// Activer les écrans natifs pour améliorer les performances
enableScreens();

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
        <Stack.Screen name="AddRecipe" component={AddRecipeScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;