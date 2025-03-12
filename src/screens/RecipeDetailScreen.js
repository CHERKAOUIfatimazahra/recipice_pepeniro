import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecipeDetailScreen = ({route, navigation}) => {
  const {recipe} = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = recipe.strMeal || recipe.name;
  const category = recipe.strCategory || recipe.category;
  const area = recipe.strArea || recipe.area;
  const instructions = recipe.strInstructions || recipe.instructions;
  const imageSource = recipe.strMealThumb
    ? {uri: recipe.strMealThumb}
    : recipe.imageUri;

  const getIngredients = () => {
    if (recipe.ingredients) {
      return recipe.ingredients;
    }

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];

      if (ingredient && ingredient.trim()) {
        ingredients.push({name: ingredient, measure: measure || ''});
      }
    }
    return ingredients;
  };

  const ingredients = getIngredients();

  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const favoritesJSON = await AsyncStorage.getItem('favoriteRecipes');
        if (favoritesJSON) {
          const favorites = JSON.parse(favoritesJSON);
          const isRecipeFavorite = favorites.some(
            fav =>
              (fav.idMeal && recipe.idMeal && fav.idMeal === recipe.idMeal) ||
              (fav.id && recipe.id && fav.id === recipe.id),
          );
          setIsFavorite(isRecipeFavorite);
        }
      } catch (error) {
        console.error('Error checking favorites:', error);
      }
    };

    checkIfFavorite();
  }, [recipe]);

  const toggleFavorite = async () => {
    try {
      setLoading(true);
      const favoritesJSON = await AsyncStorage.getItem('favoriteRecipes');
      let favorites = favoritesJSON ? JSON.parse(favoritesJSON) : [];

      if (isFavorite) {
        favorites = favorites.filter(
          fav =>
            !(fav.idMeal && recipe.idMeal && fav.idMeal === recipe.idMeal) &&
            !(fav.id && recipe.id && fav.id === recipe.id),
        );
      } else {
        favorites.push(recipe);
      }

      await AsyncStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
      setIsFavorite(!isFavorite);

      Alert.alert(
        'Succès',
        isFavorite
          ? 'Recette retirée des favoris'
          : 'Recette ajoutée aux favoris',
        [{text: 'OK'}],
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour les favoris');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.recipeImage} />

          {/* Bouton retour */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {/* Bouton favoris */}
          <TouchableOpacity
            style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
            onPress={toggleFavorite}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.favoriteButtonText}>♥</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>

          {/* Métadonnées */}
          <View style={styles.metaContainer}>
            {category && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Catégorie</Text>
                <Text style={styles.metaValue}>{category}</Text>
              </View>
            )}

            {area && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Origine</Text>
                <Text style={styles.metaValue}>{area}</Text>
              </View>
            )}
          </View>

          {/* Ingrédients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingrédients</Text>
            {ingredients.map((item, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientText}>
                  • {item.name}
                  {item.measure ? `: ${item.measure}` : ''}
                </Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>{instructions}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    marginTop: 20,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteActive: {
    backgroundColor: '#DC3545',
  },
  favoriteButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  metaItem: {
    marginRight: 20,
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D6EFD',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  ingredientItem: {
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: '#212529',
  },
  instructionsText: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 24,
  },
});

export default RecipeDetailScreen;