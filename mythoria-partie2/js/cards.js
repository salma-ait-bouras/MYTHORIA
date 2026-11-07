import { chargerElements } from "./state.js";
import { genererIdentifiant, melanger } from "./utils.js";

function estUneCreature(carte) {
  const type = (carte.type || "").toLowerCase();
  return !type.includes("sort") && !type.includes("spell");
}

function trouverCamp(carte) {
  if (carte.camp) return carte.camp;

  const type = (carte.type || "").toLowerCase();

  if (type.includes("monstre") || type.includes("monster")) {
    return "Ténèbres";
  }

  return "Lumière";
}

function creerCarteDeCombat(carte) {
  const attaque = Number(carte.attaque || carte.attack || 100);
  const pointsDeVie = Number(carte.vie || carte.hp || 100);

  return {
    identifiant: genererIdentifiant(),
    id: carte.id,
    nom: carte.nom || carte.name || "Carte",
    type: carte.type || "Créature",
    camp: trouverCamp(carte),
    attaque: attaque,
    vie: pointsDeVie,
    vieMaximale: pointsDeVie,
    actionUtilisee: false,
    enDefense: false
  };
}

export function creerLesPaquets() {
  const catalogue = (window.MYTHORIA_CARDS || []).filter(estUneCreature);
  const collection = chargerElements("mythoriaCollection", []);
  const identifiantsDuDeck = chargerElements("mythoria_deck", []);

  const cartesDuJoueur = identifiantsDuDeck
    .map(identifiant => {
      return collection.find(
        carte => String(carte.id) === String(identifiant)
      ) || catalogue.find(
        carte => String(carte.id) === String(identifiant)
      );
    })
    .filter(carte => carte && estUneCreature(carte))
    .map(creerCarteDeCombat);

  const cartesAdverses = melanger(
    [...catalogue, ...catalogue].map(creerCarteDeCombat)
  );

  return {
    paquetJoueur: melanger(cartesDuJoueur),
    paquetAdversaire: cartesAdverses
  };
}

export function piocherUneCarte(combattant) {
  if (combattant.main.length >= 5 || combattant.paquet.length === 0) {
    return false;
  }

  combattant.main.push(combattant.paquet.pop());
  return true;
}

export function distribuerLaMain(combattant) {
  for (let nombre = 0; nombre < 5; nombre++) {
    piocherUneCarte(combattant);
  }
}