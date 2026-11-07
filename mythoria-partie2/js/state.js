
export function chargerElements(cle, valeurParDefaut = []) {
  try {
    const elementsEnregistres = localStorage.getItem(cle);
    return elementsEnregistres
      ? JSON.parse(elementsEnregistres)
      : valeurParDefaut;
  } catch {
    return valeurParDefaut;
  }
}

export function enregistrerElements(cle, elements) {
  localStorage.setItem(cle, JSON.stringify(elements));
}

export function ajouterElement(cle, nouvelElement) {
  const elements = chargerElements(cle, []);
  elements.push(nouvelElement);
  enregistrerElements(cle, elements);
  return elements;
}