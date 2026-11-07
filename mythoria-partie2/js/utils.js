export function genererIdentifiant() {
  return Date.now() + "-" + Math.floor(Math.random() * 100000);
}

export function formaterHeure(date = new Date()) {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function melanger(elements) {
  const resultat = [...elements];

  for (let index = resultat.length - 1; index > 0; index--) {
    const positionAleatoire = Math.floor(Math.random() * (index + 1));
    [resultat[index], resultat[positionAleatoire]] =
      [resultat[positionAleatoire], resultat[index]];
  }

  return resultat;
}