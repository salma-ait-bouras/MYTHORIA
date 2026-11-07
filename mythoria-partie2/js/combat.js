import { formaterHeure } from "./utils.js";

export function ajouterAHistorique(partie, message) {
  partie.historique.unshift(`${formaterHeure()} — ${message}`);
}

export function verifierLeVainqueur(partie) {
  if (partie.joueur.vie <= 0) {
    partie.phase = "terminee";
    partie.vainqueur = "adversaire";
    ajouterAHistorique(partie, "L'adversaire a gagné.");
  } else if (partie.adversaire.vie <= 0) {
    partie.phase = "terminee";
    partie.vainqueur = "joueur";
    ajouterAHistorique(partie, "Tu as gagné !");
  }
}

export function invoquerUneCarte(partie, campQuiJoue, identifiantCarte) {
  if (partie.phase !== "combat" || partie.tour !== campQuiJoue) return false;

  const combattant = partie[campQuiJoue];
  if (combattant.terrain.length >= 10) return false;

  const position = combattant.main.findIndex(
    carte => carte.identifiant === identifiantCarte
  );
  if (position === -1) return false;

  const carte = combattant.main.splice(position, 1)[0];

  if (carte.camp !== combattant.camp) {
    carte.attaque = Math.floor(carte.attaque * 0.8);
    carte.vie = Math.floor(carte.vie * 0.8);
    carte.vieMaximale = carte.vie;
  }

  combattant.terrain.push(carte);
  ajouterAHistorique(partie, `${combattant.nom} invoque ${carte.nom}.`);
  return true;
}

export function attaquer(partie, campQuiJoue, identifiantAttaquant, identifiantCible = null) {
  if (partie.phase !== "combat" || partie.tour !== campQuiJoue) return false;

  const attaquant = partie[campQuiJoue];
  const defenseur = campQuiJoue === "joueur"
    ? partie.adversaire
    : partie.joueur;

  const carteAttaquante = attaquant.terrain.find(
    carte => carte.identifiant === identifiantAttaquant
  );

  if (!carteAttaquante || carteAttaquante.actionUtilisee) return false;

  if (!identifiantCible) {
    if (defenseur.terrain.length > 0) return false;

    defenseur.vie -= carteAttaquante.attaque;
    carteAttaquante.actionUtilisee = true;

    ajouterAHistorique(
      partie,
      `${carteAttaquante.nom} attaque directement : ${carteAttaquante.attaque} dégâts.`
    );

    verifierLeVainqueur(partie);
    return true;
  }

  const carteCible = defenseur.terrain.find(
    carte => carte.identifiant === identifiantCible
  );
  if (!carteCible) return false;

  let degats = carteAttaquante.attaque;

  if (carteCible.enDefense) {
    degats = Math.ceil(degats / 2);
    carteCible.enDefense = false;
  }

  carteCible.vie -= degats;
  carteAttaquante.actionUtilisee = true;

  ajouterAHistorique(
    partie,
    `${carteAttaquante.nom} inflige ${degats} dégâts à ${carteCible.nom}.`
  );

  if (carteCible.vie <= 0) {
    defenseur.terrain = defenseur.terrain.filter(
      carte => carte.identifiant !== identifiantCible
    );
    ajouterAHistorique(partie, `${carteCible.nom} est détruite.`);
  }

  verifierLeVainqueur(partie);
  return true;
}

export function seDefendre(partie, campQuiJoue, identifiantCarte) {
  if (partie.phase !== "combat" || partie.tour !== campQuiJoue) return false;

  const carte = partie[campQuiJoue].terrain.find(
    element => element.identifiant === identifiantCarte
  );

  if (!carte || carte.actionUtilisee) return false;

  carte.enDefense = true;
  carte.actionUtilisee = true;
  ajouterAHistorique(partie, `${carte.nom} se met en défense.`);
  return true;
}