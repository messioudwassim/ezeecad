import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router ne remet jamais le scroll en haut de page tout seul lors
 * d'un changement de route (contrairement à une vraie navigation navigateur).
 * Sans ce composant, cliquer un lien du Footer (ou tout autre lien) depuis
 * le bas d'une longue page change bien le contenu mais laisse le visiteur
 * scrollé en bas de la nouvelle page.
 *
 * A monter une seule fois, à l'intérieur du <BrowserRouter>, au-dessus des
 * <Routes> (voir App.tsx).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}