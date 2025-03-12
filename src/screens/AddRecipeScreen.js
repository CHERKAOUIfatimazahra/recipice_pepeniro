import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';

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
  back: '←',
  add: '+',
  remove: '-',
  image: '🖼️',
};

const AddRecipeScreen = ({navigation}) => {
  const [recipe, setRecipe] = useState({
    id: Date.now().toString(),
    name: '',
    category: '',
    area: '',
    instructions: '',
    imageUri: '',
    ingredients: [{name: '', measure: ''}],
    isCustom: true,
  });

  const [categories, setCategories] = useState([
    'Breakfast',
    'Starter',
    'Main',
    'Dessert',
    'Seafood',
    'Vegetarian',
    'Vegan',
    'Other',
  ]);

  const handleChange = (key, value) => {
    setRecipe({
      ...recipe,
      [key]: value,
    });
  };

  const handleIngredientChange = (index, key, value) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [key]: value,
    };
    setRecipe({
      ...recipe,
      ingredients: updatedIngredients,
    });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, {name: '', measure: ''}],
    });
  };

  const removeIngredient = index => {
    if (recipe.ingredients.length > 1) {
      const updatedIngredients = recipe.ingredients.filter(
        (_, i) => i !== index,
      );
      setRecipe({
        ...recipe,
        ingredients: updatedIngredients,
      });
    }
  };

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log("L'utilisateur a annulé la sélection d'image");
      } else if (response.errorCode) {
        console.log('Erreur ImagePicker: ', response.errorMessage);
      } else {
        const imageUri = response.assets[0].uri;
        setRecipe({
          ...recipe,
          imageUri,
        });
      }
    });
  };

  const validateForm = () => {
    if (!recipe.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour la recette');
      return false;
    }

    if (!recipe.category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }

    if (!recipe.instructions.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter des instructions');
      return false;
    }

    const validIngredients = recipe.ingredients.filter(
      ing => ing.name.trim() !== '',
    );
    if (validIngredients.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins un ingrédient');
      return false;
    }

    return true;
  };

  const saveRecipe = async () => {
    if (!validateForm()) return;

    try {
      const existingRecipesJSON = await AsyncStorage.getItem('customRecipes');
      let existingRecipes = existingRecipesJSON
        ? JSON.parse(existingRecipesJSON)
        : [];

      const validIngredients = recipe.ingredients.filter(
        ing => ing.name.trim() !== '',
      );

      const recipeToSave = {
        ...recipe,
        ingredients: validIngredients,
      };

      existingRecipes.push(recipeToSave);

      await AsyncStorage.setItem(
        'customRecipes',
        JSON.stringify(existingRecipes),
      );

      Alert.alert('Succès', 'Votre recette a été ajoutée avec succès!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la recette');
    }
  };

  const renderCategoryItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        recipe.category === item && styles.categoryChipSelected,
      ]}
      onPress={() => handleChange('category', item)}>
      <Text
        style={[
          styles.categoryChipText,
          recipe.category === item && styles.categoryChipTextSelected,
        ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
        translucent={false}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>{ICONS.back} Retour</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nouvelle Recette</Text>
          </View>

          <View style={styles.formContainer}>
            <TouchableOpacity
              style={styles.imageSelector}
              onPress={selectImage}>
              {recipe.imageUri ? (
                <Image
                  source={{uri: recipe.imageUri}}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderEmoji}>
                    {ICONS.image}
                  </Text>
                  <Text style={styles.imagePlaceholderText}>
                    Appuyez pour ajouter une image
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Nom de la recette */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom de la recette *</Text>
              <TextInput
                style={styles.input}
                value={recipe.name}
                onChangeText={text => handleChange('name', text)}
                placeholder="Ex: Crevettes à l'ail"
                placeholderTextColor={COLORS.grey}
              />
            </View>

            {/* Catégorie */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catégorie *</Text>
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
            </View>

            {/* Origine */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Origine</Text>
              <TextInput
                style={styles.input}
                value={recipe.area}
                onChangeText={text => handleChange('area', text)}
                placeholder="Ex: Française, Italienne, etc."
                placeholderTextColor={COLORS.grey}
              />
            </View>

            {/* Ingrédients */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ingrédients *</Text>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <TextInput
                    style={[styles.input, styles.ingredientInput]}
                    value={ingredient.name}
                    onChangeText={text =>
                      handleIngredientChange(index, 'name', text)
                    }
                    placeholder="Ingrédient"
                    placeholderTextColor={COLORS.grey}
                  />
                  <TextInput
                    style={[styles.input, styles.measureInput]}
                    value={ingredient.measure}
                    onChangeText={text =>
                      handleIngredientChange(index, 'measure', text)
                    }
                    placeholder="Quantité"
                    placeholderTextColor={COLORS.grey}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeIngredient(index)}>
                    <Text style={styles.removeButtonText}>{ICONS.remove}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addIngredientButton}
                onPress={addIngredient}>
                <Text style={styles.backButtonText}>
                  {ICONS.add} Ajouter un ingrédient
                </Text>
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instructions *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={recipe.instructions}
                onChangeText={text => handleChange('instructions', text)}
                placeholder="Étapes de préparation..."
                placeholderTextColor={COLORS.grey}
                multiline
                textAlignVertical="top"
                numberOfLines={6}
              />
            </View>

            {/* Bouton de sauvegarde */}
            <View>
              <TouchableOpacity style={styles.saveButton} onPress={saveRecipe}>
                <Text style={styles.saveButtonText}>
                  Enregistrer la recette
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: 50,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.15)',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginLeft: 15,
  },
  formContainer: {
    padding: 20,
  },
  imageSelector: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderEmoji: {
    fontSize: 36,
    marginBottom: 10,
    color: COLORS.grey,
  },
  imagePlaceholderText: {
    color: COLORS.grey,
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.dark,
  },
  textArea: {
    minHeight: 120,
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  ingredientInput: {
    flex: 3,
    marginRight: 10,
  },
  measureInput: {
    flex: 2,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.15)',
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  removeButtonText: {
    fontSize: 18,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  addIngredientButton: {
    backgroundColor: 'rgba(196, 106, 46, 0.15)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.15)',
  },
  addIngredientButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginBottom: 10,
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
});

export default AddRecipeScreen;
