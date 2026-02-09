# Poids et masse (3e)

Webapp pedagogique pour tracer les points experimentaux, effectuer une regression lineaire, et comparer avec la droite theorique `P = m * g`.

## Fonctionnalites

- Saisie **Nom / Prenom / Classe**.
- Choix du **nombre de mesures**.
- Saisie des valeurs de masse et de poids + **unites** (kg/g, N/mN).
- Graphique avec points, regression lineaire et droite theorique.
- Calcul de la pente et ecart relatif.
- Export du graphe en PNG.
- Export PDF direct (sans imprimer) incluant les infos eleve.
- Mode **eleve / prof**.
- Remplissage automatique d'un **jeu d'exemple** (10/15/20 mesures).
- Mode PWA (installable sur smartphone).

## Guides

- Eleve : `GUIDE_ELEVE.md`
- Prof : `GUIDE_PROF.md`

## Captures d'ecran

Ajoutees dans `assets/screens/`.

- Eleve : `assets/screens/student.png`
- Prof : `assets/screens/teacher.png`

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
