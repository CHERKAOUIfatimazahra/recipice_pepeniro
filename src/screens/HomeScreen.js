import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#FF6B35',
  secondary: '#2EC4B6',
  accent: '#FDCA40',
  dark: '#212529',
  grey: '#6C757D',
  lightGrey: '#E9ECEF',
  white: '#FFFFFF',
  error: '#DC3545',
  success: '#198754',
};

const ICONS = {
  heart: '♥',
  heartEmpty: '♡',
  star: '♥',
  plus: '+',
};

const windowWidth = Dimensions.get('window').width;

const HomeScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const navigation = useNavigation();

  useEffect(() => {
    const fetchRecipesAndCategories = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favoriteRecipes');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }

        const response = await fetch(
          'https://www.themealdb.com/api/json/v1/1/search.php?s=',
        );
        const data = await response.json();
        const apiRecipes = data.meals || [];

        const customRecipesJSON = await AsyncStorage.getItem('customRecipes');
        const customRecipes = customRecipesJSON
          ? JSON.parse(customRecipesJSON)
          : [];

        const allRecipes = [...apiRecipes, ...customRecipes];
        setRecipes(allRecipes);
        setFilteredRecipes(allRecipes);

        const uniqueCategories = [
          ...new Set(
            allRecipes
              .filter(recipe => recipe.strCategory || recipe.category)
              .map(recipe => recipe.strCategory || recipe.category),
          ),
        ];

        setCategories(['All', ...uniqueCategories]);
      } catch (error) {
        console.error('Erreur lors du chargement des recettes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipesAndCategories();
  }, []);

  useEffect(() => {
    let results = recipes;

    if (searchTerm) {
      results = results.filter(recipe => {
        const title = recipe.strMeal || recipe.name || '';
        return title.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (selectedCategory !== 'All') {
      results = results.filter(recipe => {
        const category = recipe.strCategory || recipe.category || '';
        return category === selectedCategory;
      });
    }

    setFilteredRecipes(results);
  }, [searchTerm, selectedCategory, recipes]);

  const isFavorite = recipe =>
    favorites.some(
      fav =>
        (fav.idMeal && recipe.idMeal && fav.idMeal === recipe.idMeal) ||
        (fav.id && recipe.id && fav.id === recipe.id),
    );

  const toggleFavorite = async recipe => {
    try {
      let updatedFavorites = [...favorites];

      if (isFavorite(recipe)) {
        updatedFavorites = updatedFavorites.filter(
          fav =>
            !(fav.idMeal && recipe.idMeal && fav.idMeal === recipe.idMeal) &&
            !(fav.id && recipe.id && fav.id === recipe.id),
        );
      } else {
        updatedFavorites.push(recipe);
      }

      await AsyncStorage.setItem(
        'favoriteRecipes',
        JSON.stringify(updatedFavorites),
      );
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
    }
  };

  const renderCategoryItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipSelected,
      ]}
      onPress={() => setSelectedCategory(item)}>
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item && styles.categoryChipTextSelected,
        ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🍽️</Text>
      <Text style={styles.emptyText}>Aucune recette trouvée</Text>
      <Text style={styles.emptySubText}>
        Essayez une autre recherche ou ajoutez une nouvelle recette
      </Text>
    </View>
  );

  const renderRecipeItem = ({item}) => (
    <TouchableOpacity
      style={styles.recipeCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('RecipeDetail', {recipe: item})}>
      <View style={styles.imageContainer}>
        <Image
          source={{uri: item.strMealThumb || item.imageUri}}
          style={styles.image}
        />

        {/* Badge catégorie */}
        {(item.strCategory || item.category) && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {(item.strCategory || item.category).length > 12
                ? (item.strCategory || item.category).substring(0, 10) + '...'
                : item.strCategory || item.category}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <Text style={styles.recipeTitle}>{item.strMeal || item.name}</Text>

          <View style={styles.metaInfo}>
            {(item.strArea || item.area) && (
              <Text style={styles.originText}>{item.strArea || item.area}</Text>
            )}
          </View>
        </View>

        {/* Bouton Favori */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite(item) && styles.favoriteActive,
          ]}
          onPress={() => toggleFavorite(item)}>
          <Text style={styles.favoriteButtonText}>
            {isFavorite(item) ? ICONS.heart : ICONS.heartEmpty}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
        translucent={false}
      />
      <View style={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Pepe Nero</Text>
            <Text style={styles.subtitle}>
              Découvrez nos recettes de cuisine
            </Text>
          </View>

          {/* Bouton Favoris */}
          <TouchableOpacity
            style={styles.favoritesButton}
            onPress={() => navigation.navigate('Favorites')}>
            <Text style={styles.favoritesButtonText}>{ICONS.star}</Text>
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Rechercher une recette..."
            placeholderTextColor={COLORS.grey}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Catégories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            keyExtractor={item => item}
            renderItem={renderCategoryItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Chargement des recettes...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={item => item.idMeal || item.id}
            renderItem={renderRecipeItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyComponent}
            numColumns={1}
          />
        )}

        {/* Bouton flottant pour ajouter une recette */}
        <View style={[styles.addButtonContainer]}>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate('AddRecipe');
            }}>
            <Text style={styles.addButtonText}>{ICONS.plus}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 30,
  },
  header: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.grey,
  },
  favoritesButton: {
    backgroundColor: 'rgba(253, 202, 64, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  favoritesButtonText: {
    color: COLORS.dark,
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 236, 239, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchIcon: {
    fontSize: 18,
    color: COLORS.grey,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.dark,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(233, 236, 239, 0.75)',
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
  },
  categoryChipTextSelected: {
    color: COLORS.white,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.grey,
  },
  listContainer: {
    paddingBottom: 80,
  },
  recipeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(46, 196, 182, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 6,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originText: {
    fontSize: 14,
    color: COLORS.grey,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(233, 236, 239, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteActive: {
    backgroundColor: COLORS.error,
  },
  favoriteButtonText: {
    fontSize: 20,
    color: COLORS.white,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: COLORS.grey,
    textAlign: 'center',
  },
});

export default HomeScreen;
