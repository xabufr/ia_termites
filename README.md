TP Termites
===========
Groupe:
Alexandre RAMEL
Thomas LOUBIOU
Code source: https://github.com/xabufr/ia_termites
Démo: http://xabufr.github.io/ia_termites/


Techniques mises en place
Communication
Négociation du nid
Système expert
Exploration
Path finding A*
Répartition des tas
Comportement d’une termite
Idées d’améliorations

#Techniques mises en place
Communication
Les termites communiquent entre elles les éléments suivants:
La liste des murs connus (position, taille, identifiant),
La liste des tas de bois avec leur taille, position et identifiant,
Le nid à utiliser (via une négociation - partie à part entière)
La liste des murs permet aux termites de trouver le chemin le plus court sans collision (grâce à une recherche de chemin A*).
Négociation du nid
Le nid d’une termite est déterminé par plusieurs facteurs:
Si elle croise un tas de bois plus intéressant que son nid, ou si elle n’a pas de nid, alors elle fait de ce tas son nid.
Si elle croise une termite qui a un tas de bois plus intéressant que le sien, alors elle change,
Sinon si elle croise une termite ayant le même tas qu’elle elles s’échangent les termites appartenant au nid.

Un tas / nid est plus intéressant pour une termite à partir du moment ou il a plus de bois et / ou plus de termites reliées. On peut calculer cela avec une simple addition (WoodCount + nid.termites.length)
Système expert
Toute la partie décision / comportement global est régie par un système expert. Les règles de ce système sont décrites plus bas.

Toutes la partie mise à jours des connaissances du système est réalisée dans une fonction dédiée.
Exploration
Lorsque les termites ne connaissent pas suffisamment de tas de bois pour effectuer des déplacements de bois, alors elle passent en mode exploration: elle choisissent un point de manière aléatoire sur la carte (qui n’entre pas en collision avec un mur ni ne sort des limites de la carte).
De cette manière tous les points libres sont théoriquement atteints (pour peut que la méthode Math.random() de javascript soit équiprobable, et que les murs ne divisent pas la carte en deux).

De plus, grâce au comportement établi (voir partie dédiée), la propagation des informations est fortement améliorée par cette technique (une termite se balade plus longtemps sur la carte et propage plus loin ses informations).
#Path finding A*
Pour tous leurs déplacements les termites utilisent un chemin généré grâce à l’algorithme de recherche de chemin A*.
La grille nécessaire à la recherche est générée de telle sorte qu’un case vide soit entièrement vide, sans aucun bout de mur, alors qu’une case pleine soit entièrement occupée par une portion de mur.
Les grandes cases sont subdivisée afin de lisser le chemin trouvé.
Il est possible de dessiner cette grille de recherche en passant en mode debug, qui affiche les informations de path finding de la termite jaune.

Le path finding utilisé trouve les chemin en diagonale lorsque c’est possible (c’est à dire qu’il n’y a pas de portion de mur entre deux cases mises en biais).

¿ Nécessite un schémas ?

La distance euclidienne est utilisée comme euristique de recherche.

Une fois le chemin trouvé, la termite passera par tous les centres de toutes les cases jusqu’à arriver dans la case de destination où elle ira directement à sa destination finale.

#Répartition des tas
Lorsqu’une termite connaît plusieurs tas, elle en choisi un de manière aléatoire.
La probabilité qu’une termite aille sur un tas est proportionnelle à la taille du tas. Ainsi tous les tas connus d’un groupe de termites voient leur taille décroître de manière identique.
Cela évite d’avoir toutes les termites sur un seul petit tas quand il y a d’autres possibilités, et donc de se retrouver avec un déplacement massif inutile.

#Comportement d’une termite
Chaque termite suit ces règles, dictées par le système expert:
Si elle ne connaît aucun tas de bois en dehors de son nid, et ne bouge pas, elle va à un point choisi aléatoirement,
Si elle connaît un tas en dehors de son nid, qu’elle ne bouge pas et n’a pas de bois, alors elle va chercher du bois,
Si elle a du bois et un nid alors elle se dirige vers le nid,
Si elle touche le nid et a du bois, elle le dépose,
Si elle touche un tas qui n’est pas sont nid elle prend du bois.
Ainsi la seule façon d’arrêter une termite qui se déplace est de lui faire toucher un tas de bois. Ce comportement favorise la circulation des informations (les termites parcourent plus de chemin avant de faire des voyages entre tas).

#Idées d’améliorations
Nous n’avons que peu d’idée pour améliorer l’IA de nos termites, et quelques unes pour améliorer les performances du programmé:
Mettre en cache les résultats des recherches de chemin,
Ne plus passer par les centres des cases choisies par A* mais déterminer les positions intermédiaires les plus courtes,
Améliorer la communication entre termites (mettre en place plus de caches, recherche dichotomique, …),
Refaire le projet en C++ compilé en ASM.js pour avoir des performances proches du natif tout en restant web.
