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

**11/11/2015 - 12/11/2015**

Il  y aurait une perte de précision sur android, dû à une moins bonne réduction de bruit par l'OS. Cependant j'essaierai tout de même de trouver une solution afin d'améliorer cela.

Je me concentre maintenant sur l'integration à Ionic, je vais probablement crééer un service angular pour gérér mes estimotes.

J'ai initialisé une application *tabs* avec `ionic start inca tabs`

J'ai initialisé un repo git sur [GitHub](https://github.com/charleshaa/projetSemestre)

Après avoir installé [le plugin cordova][5bc7f405], j'ai réussi avec succès à créer un service angular `Estimote` qui va gérer les events et contenir des fonctions
helper.

Mes premiers test sont passés, consistant à détecter les beacons et afficher leur distance en temps réél.

*Il faudrait peut-être que je créée dans le service une méthode pour leurrer des beacons afin de pouvoir continuer à coder sur chrome au lieu de build à chaque fois.*

Je vais tester tout ça sur android.

Pas de problèmes sur android.

**RSSI**

>RSSI stands for Received Signal Strength Indicator. It is the strength of the beacon's signal as seen on the receiving device, e.g. a smartphone. The signal strength depends on distance and Broadcasting Power value. At maximum Broadcasting Power (+4 dBm) the RSSI ranges from -26 (few inches) to -100 (40-50 m distance).
>
RSSI is used to approximate distance between the device and the beacon using another value defined by the iBeacon standard: Measured Power (see below).
Due to external factors influencing radio waves—such as absorption, interference or diffraction—RSSI tends to fluctuate. The further away the device is from the beacon, the more unstable the RSSI becomes.

Afin d'être plus précis, je vais essayer de faire une moyenne des signaux sur 3 emissions.





  [5bc7f405]: https://github.com/evothings/phonegap-estimotebeacons
