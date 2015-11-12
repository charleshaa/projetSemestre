# Semester project Dev notes

**5/11/2015**


Tout d'abord, j'ai déjà de l'expérience dans AngularJS, Cordova & Ionic.

Du coup, j'ai commencé par me renseigner sur les iBeacons estimote. J'ai trouvé un plugin cordova qui permet d'accéder à l'API Estimote native dans nos fichiers javascript.

[phonegap-estimotes][5bc7f405]

J'ai pu faire fonctionner l'application sur le téléphone fourni par l'école (Android 5 LG G3) et sur iPhone. A noter que sur Android, on peut range les beacons mais pas les scanner.

J'ai pu montrer cela à M. Gluck, qui m'a conseillé de continuer sur:

- Le calcul de distance
- Intégrer tout ça à Ionic
- Commencer ce rapport :p

### Calcul de distance

Le calcul de distance des beacons se fait par un appel de fonction au SDK Estimote, qui nous retourne la distance en mètres.
C'est la méthode `Utils.computeAccuracy` en Java

[Voir ici](https://estimote.github.io/Android-SDK/JavaDocs/com/estimote/sdk/Utils.html#computeAccuracy)

**12/11/2015**

Il  y aurait une perte de précision sur android, dû à une moins bonne réduction de bruit par l'OS. Cependant j'essaierai tout de même de trouver une solution afin d'améliorer cela.

Je me concentre maintenant sur l'integration à Ionic, je vais probablement crééer un service angular pour gérér mes estimotes.

J'ai initialisé une application *tabs* avec `ionic start inca tabs`

J'ai initialisé un repo git sur [GitHub](https://github.com/charleshaa/projetSemestre)







  [5bc7f405]: https://github.com/evothings/phonegap-estimotebeacons
