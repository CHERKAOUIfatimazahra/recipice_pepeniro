# Application Pepe Nero Restaurant

Une application mobile React Native permettant aux utilisateurs de découvrir de nouvelles recettes via l'API The Recettes.

## Contexte du projet

Le restaurant Pepe Nero cherche à améliorer l'expérience de ses utilisateurs en leur permettant de découvrir de nouvelles recettes. Ils ont donc décidé de créer une application mobile qui utilise l'API de The Recettes pour afficher une liste de repas.

## Objectifs d'apprentissage

- **Compréhension de React Native** : Maîtriser les concepts fondamentaux de React Native CLI, y compris la structure du projet et la création de composants.
- **Gestion de la Navigation** : Utiliser React Navigation pour créer une navigation fluide entre les écrans de l'application.
- **Intégration des Composants et Styles** : Utiliser divers composants React Native pour structurer l'interface utilisateur, en personnalisant les styles.
- **Utilisation d'API Externe** : Intégrer des données de recettes depuis une API externe.
- **Stockage Local** : Utiliser AsyncStorage pour permettre aux utilisateurs de sauvegarder leurs recettes préférées localement.

## Fonctionnalités du projet

1. **Liste des Recettes** : Afficher une liste de recettes provenant de l'API externe.
2. **Détails de la Recette** : Créer une vue détaillée pour chaque recette, montrant les ingrédients, les étapes de préparation, et éventuellement une image.
3. **Ajout de Recettes** : Permettre aux utilisateurs d'ajouter de nouvelles recettes avec des détails complets.
4. **Stockage Local** : Implémenter le stockage local pour sauvegarder les recettes préférées de l'utilisateur.
5. **Améliorations optionnelles** : Intégrer des fonctionnalités avancées telles que la recherche de recettes, la catégorisation des recettes, ou des animations.
6. **Tests et Déploiement** : Tester l'application et déployer sur un émulateur ou un appareil physique.

## Démarrage

> **Remarque** : Assurez-vous d'avoir complété la [configuration de l'environnement React Native](https://reactnative.dev/docs/set-up-your-environment) avant de continuer.

### Étape 1 : Installer les dépendances

```sh
# Avec npm
npm install
# OU avec Yarn
yarn install
```

### Étape 2 : Démarrer Metro avec reset du cache

```sh
npx react-native start --reset-cache
```

### Étape 3 : Exécuter l'application

#### Android

```sh
npx react-native run-android
```

#### iOS

Pour iOS, installez d'abord les dépendances CocoaPods :

```sh
bundle install
bundle exec pod install
```

Puis exécutez l'application :

```sh
# Avec npm
npm run ios
# OU avec Yarn
yarn ios
```

## Technologies utilisées

Le projet utilise les dépendances suivantes (version 0.0.1) :

### Dépendances principales
- React 19.0.0
- React Native 0.78.0
- React Navigation (Native 7.0.15, Stack 7.1.2)
- AsyncStorage 2.1.2
- React Native Gesture Handler 2.24.0
- React Native Image Picker 8.2.0
- React Native Reanimated 3.17.1
- React Native Safe Area Context 5.3.0
- React Native Screens 4.9.1
- React Native Vector Icons 10.2.0

### Dépendances de développement
- TypeScript 5.0.4
- ESLint 8.19.0
- Jest 29.6.3
- Prettier 2.8.8
- Diverses configurations Babel et React Native

## Commandes de développement

| Commande | Description |
|---------|-------------|
| `npx react-native start --reset-cache` | Démarrer le bundler Metro avec reset du cache |
| `npx react-native run-android` | Construire et exécuter sur Android |
| `npm run ios` | Construire et exécuter sur iOS |
| `npm run test` | Exécuter les tests |
| `npm run lint` | Exécuter le linter |

## Configuration requise

- Node.js >=18

## Dépannage

Si vous rencontrez des problèmes, veuillez consulter le [Guide de dépannage React Native](https://reactnative.dev/docs/troubleshooting).
