# Poids et masse (3e)

Webapp pedagogique pour exploiter des mesures de poids et masse en 3e : saisie des donnees, regression lineaire, comparaison a la valeur de g, et rapport PDF eleve.

## Ce que fait la webapp

- Saisie **Nom / Prenom / Classe** + **incertitude estimee**.
- Choix du **nombre de mesures**.
- Saisie des valeurs de masse et de poids + **unites** (kg/g, N/mN).
- Graphique avec points, regression lineaire et droite theorique.
- Calcul de la pente et ecart relatif.
- Section **Questions** avec aides activables.
- Paragraphe historique + frise sur la mesure de g.
- Export du graphe en PNG.
- Export **rapport PDF** (couverture, graphique, resultats, tableau, reponses).
- Option **tableau complet en annexe** (3e page).
- Bouton **Reinitialiser cache** (utile avec GitHub Pages/PWA).
- Mode PWA (installable sur smartphone).

## Guides

- Eleve : `GUIDE_ELEVE.md`
- Prof : `GUIDE_PROF.md`

## Lancer en local

- Ouvrir `index.html` dans un navigateur.

## Deploiement (GitHub Pages)

1. Settings -> Pages
2. Source : `Deploy from a branch`
3. Branch : `main` / `/(root)`

URL attendue : `https://loicmariey-tech.github.io/poids-masse-webapp/`

## Donnees

- Masse en **kg** (ou g converti automatiquement)
- Poids en **N** (ou mN converti automatiquement)

## Conseils en cas de cache

Si une ancienne version s affiche :
- Ouvrir `https://loicmariey-tech.github.io/poids-masse-webapp/index.html?v=20260209`
- Cliquer **Reinitialiser cache**
