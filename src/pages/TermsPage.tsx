import { useLang } from '@/context/LangContext';
import LegalLayout, { Section } from '@/components/LegalLayout';

const COMPANY_PLACEHOLDER_FR = '[Raison sociale / nom de l\'entreprise à compléter]';
const COMPANY_PLACEHOLDER_EN = '[Company name to be completed]';

export default function TermsPage() {
  const { lang } = useLang();
  const isEn = lang === 'en';

  return (
    <LegalLayout
      title={isEn ? 'Terms and Conditions of Sale' : 'Conditions Générales de Vente'}
      lastUpdated={isEn ? 'Last updated: August 2026' : 'Dernière mise à jour : Août 2026'}
      arabicNotice="النسخة العربية من شروط البيع قيد الإعداد. المحتوى أدناه متوفر حاليًا باللغتين الفرنسية والإنجليزية."
    >
      {isEn ? <TermsEn /> : <TermsFr />}
    </LegalLayout>
  );
}

function TermsFr() {
  return (
    <>
      <Section title="Article 1 — Objet">
        <p>
          Les présentes Conditions Générales de Vente (« CGV ») régissent les relations contractuelles
          entre EzeeCAD (« la Plateforme »), exploitée par {COMPANY_PLACEHOLDER_FR}, immatriculée sous
          le numéro RC [à compléter] et NIF [à compléter], et toute personne (« l'Utilisateur », « le
          Client ») effectuant un achat de modèle numérique sur la Plateforme. Toute commande passée sur
          EzeeCAD implique l'acceptation sans réserve des présentes CGV.
        </p>
      </Section>

      <Section title="Article 2 — Définitions">
        <p>
          <strong>Plateforme</strong> : le site et l'application EzeeCAD accessibles à l'adresse
          ezeecad.vercel.app.<br />
          <strong>Designer</strong> : utilisateur inscrit publiant des modèles 3D destinés à la vente ou
          au téléchargement gratuit.<br />
          <strong>Client</strong> : utilisateur inscrit achetant ou téléchargeant un ou plusieurs
          modèles.<br />
          <strong>Modèle</strong> : fichier numérique (fichier CAO/3D et ressources associées) proposé
          sur la Plateforme.
        </p>
      </Section>

      <Section title="Article 3 — Compte utilisateur">
        <p>
          L'achat sur EzeeCAD nécessite la création d'un compte. L'Utilisateur s'engage à fournir des
          informations exactes et à jamais conserver la confidentialité de ses identifiants. EzeeCAD ne
          pourra être tenue responsable d'un usage frauduleux du compte résultant d'une négligence de
          l'Utilisateur.
        </p>
      </Section>

      <Section title="Article 4 — Nature des produits">
        <p>
          Les modèles vendus sur EzeeCAD sont des <strong>produits numériques immatériels</strong>,
          livrés exclusivement par téléchargement. Aucun support physique n'est fourni. Les visuels,
          aperçus 3D et descriptions sont fournis à titre indicatif ; EzeeCAD s'efforce d'assurer leur
          exactitude mais ne garantit pas l'absence totale d'écart entre l'aperçu et le fichier final.
        </p>
      </Section>

      <Section title="Article 5 — Prix et paiement">
        <p>
          Les prix sont indiqués en dinars algériens (DZD), toutes taxes comprises le cas échéant. Le
          paiement s'effectue en ligne, de manière sécurisée, via le prestataire de paiement Chargily
          (CIB, Edahabia et autres moyens proposés par ce dernier). EzeeCAD ne stocke aucune donnée
          bancaire : ces données sont traitées exclusivement par Chargily.
        </p>
        <p>
          La commande n'est confirmée qu'après validation du paiement par Chargily. En cas d'échec ou de
          refus du paiement, la commande est automatiquement annulée.
        </p>
      </Section>

      <Section title="Article 6 — Livraison">
        <p>
          Le téléchargement du modèle est mis à disposition immédiatement après confirmation du
          paiement, depuis l'espace « Mes téléchargements » du compte Client. Il appartient au Client de
          vérifier la compatibilité du format de fichier avec ses propres logiciels avant l'achat.
        </p>
      </Section>

      <Section title="Article 7 — Droit de rétractation et politique de remboursement">
        <p>
          Conformément aux pratiques standards du commerce de contenus numériques téléchargeables, et
          sous réserve des dispositions légales impératives applicables :
        </p>
        <p>
          — Tant que le fichier n'a pas été téléchargé, le Client peut demander l'annulation de sa
          commande et un remboursement intégral dans un délai de 14 jours suivant l'achat.<br />
          — Une fois le fichier téléchargé, la vente est considérée comme définitive, sauf si le modèle
          livré est <strong>manifestement défectueux, corrompu, ou substantiellement non conforme</strong>{' '}
          à sa description (auquel cas un remboursement ou un échange sera proposé, sur demande motivée
          adressée dans les 7 jours suivant l'achat).<br />
          — Aucun remboursement n'est possible en cas de simple erreur d'appréciation du Client
          (modèle non adapté à un usage particulier, incompatibilité logicielle non signalée avant
          l'achat, changement d'avis).
        </p>
        <p className="italic text-slate-500 dark:text-slate-400">
          Cette politique constitue une base standard de marché pour la vente de contenus numériques ;
          elle doit être vérifiée et, si nécessaire, ajustée par {COMPANY_PLACEHOLDER_FR} au regard de la
          réglementation applicable à son activité et à sa localisation.
        </p>
      </Section>

      <Section title="Article 8 — Propriété intellectuelle et licence d'utilisation">
        <p>
          Chaque Designer conserve la pleine propriété intellectuelle des modèles qu'il publie. L'achat
          d'un modèle confère au Client une licence d'utilisation personnelle et/ou professionnelle
          (impression, rendu, intégration dans un projet), <strong>non exclusive et non transférable</strong>.
          Sauf mention contraire explicite sur la fiche produit, le Client ne peut pas revendre,
          redistribuer, publier en libre accès ou reproposer le fichier source du modèle, seul ou modifié,
          sur une autre plateforme.
        </p>
      </Section>

      <Section title="Article 9 — Obligations des Designers">
        <p>
          Chaque Designer garantit être titulaire des droits nécessaires sur les modèles publiés et
          s'engage à ne publier aucun contenu contrefaisant, protégé par un tiers sans autorisation, ou
          contraire à la loi. EzeeCAD se réserve le droit de retirer tout modèle signalé ou suspecté
          d'infraction, sans préavis.
        </p>
      </Section>

      <Section title="Article 10 — Rôle et responsabilité de la Plateforme">
        <p>
          EzeeCAD agit en tant qu'intermédiaire technique entre Designers et Clients. La Plateforme
          modère les publications mais ne garantit pas l'exhaustivité du contrôle de chaque fichier
          déposé. La responsabilité d'EzeeCAD ne saurait être engagée au-delà du montant de la
          transaction concernée, sauf faute prouvée de sa part.
        </p>
      </Section>

      <Section title="Article 11 — Suspension et résiliation de compte">
        <p>
          EzeeCAD peut suspendre ou résilier tout compte en cas de non-respect des présentes CGV, de
          fraude, ou d'usage abusif de la Plateforme, sans préjudice d'éventuelles poursuites.
        </p>
      </Section>

      <Section title="Article 12 — Droit applicable et litiges">
        <p>
          Les présentes CGV sont soumises au droit applicable au lieu d'établissement de{' '}
          {COMPANY_PLACEHOLDER_FR}. En cas de litige, une solution amiable sera recherchée en priorité
          avant toute action contentieuse devant les juridictions compétentes.
        </p>
      </Section>

      <Section title="Article 13 — Contact">
        <p>
          Pour toute question relative aux présentes CGV, l'Utilisateur peut contacter EzeeCAD via la
          page{' '}
          <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
            Contact
          </a>{' '}
          ou à l'adresse [email de contact à compléter].
        </p>
      </Section>

      <p className="text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-800">
        Ce document est fourni à titre de modèle standard pour une marketplace de contenus numériques. Il
        ne constitue pas un avis juridique et gagnera à être relu par un professionnel du droit avant mise
        en ligne définitive, notamment pour l'immatriculation exacte de la société, la fiscalité applicable
        et la conformité au droit local.
      </p>
    </>
  );
}

function TermsEn() {
  return (
    <>
      <Section title="Article 1 — Purpose">
        <p>
          These Terms and Conditions of Sale ("Terms") govern the contractual relationship between
          EzeeCAD ("the Platform"), operated by {COMPANY_PLACEHOLDER_EN}, registered under RC number
          [to be completed] and NIF number [to be completed], and any person ("User", "Customer")
          purchasing a digital model on the Platform. Placing an order on EzeeCAD implies unconditional
          acceptance of these Terms.
        </p>
      </Section>

      <Section title="Article 2 — Definitions">
        <p>
          <strong>Platform</strong>: the EzeeCAD site and application, available at
          ezeecad.vercel.app.<br />
          <strong>Designer</strong>: registered user publishing 3D models for sale or free download.<br />
          <strong>Customer</strong>: registered user purchasing or downloading one or more models.<br />
          <strong>Model</strong>: digital file (CAD/3D file and related assets) offered on the Platform.
        </p>
      </Section>

      <Section title="Article 3 — User account">
        <p>
          Purchasing on EzeeCAD requires creating an account. Users agree to provide accurate information
          and to keep their credentials confidential at all times. EzeeCAD cannot be held liable for
          fraudulent use of an account resulting from a User's negligence.
        </p>
      </Section>

      <Section title="Article 4 — Nature of the products">
        <p>
          Models sold on EzeeCAD are <strong>intangible digital products</strong>, delivered exclusively
          by download. No physical medium is provided. Visuals, 3D previews and descriptions are provided
          for guidance; EzeeCAD strives for accuracy but does not guarantee a perfect match between the
          preview and the final file.
        </p>
      </Section>

      <Section title="Article 5 — Price and payment">
        <p>
          Prices are shown in Algerian Dinars (DZD), including applicable taxes where relevant. Payment
          is made online, securely, via the payment provider Chargily (CIB, Edahabia and other methods it
          supports). EzeeCAD does not store any banking data; this data is processed exclusively by
          Chargily.
        </p>
        <p>
          The order is only confirmed once payment is validated by Chargily. If payment fails or is
          declined, the order is automatically cancelled.
        </p>
      </Section>

      <Section title="Article 6 — Delivery">
        <p>
          The model download becomes available immediately after payment confirmation, from the "My
          Downloads" section of the Customer's account. It is the Customer's responsibility to verify
          file-format compatibility with their own software before purchase.
        </p>
      </Section>

      <Section title="Article 7 — Right of withdrawal and refund policy">
        <p>
          In line with standard market practice for downloadable digital content, and subject to
          applicable mandatory legal provisions:
        </p>
        <p>
          — As long as the file has not been downloaded, the Customer may request cancellation of the
          order and a full refund within 14 days of purchase.<br />
          — Once the file has been downloaded, the sale is considered final, unless the delivered model
          is <strong>clearly defective, corrupted, or substantially not as described</strong> (in which
          case a refund or exchange will be offered, upon reasoned request submitted within 7 days of
          purchase).<br />
          — No refund is available for a simple change of mind, unsuitability for a particular use, or
          software incompatibility not flagged before purchase.
        </p>
        <p className="italic text-slate-500 dark:text-slate-400">
          This policy is a standard market baseline for the sale of digital content; it should be
          reviewed and adjusted as needed by {COMPANY_PLACEHOLDER_EN} in light of the regulations
          applicable to its business and location.
        </p>
      </Section>

      <Section title="Article 8 — Intellectual property and license of use">
        <p>
          Each Designer retains full intellectual property rights over the models they publish.
          Purchasing a model grants the Customer a personal and/or professional license to use it
          (printing, rendering, integration into a project), which is <strong>non-exclusive and
          non-transferable</strong>. Unless explicitly stated otherwise on the product page, the Customer
          may not resell, redistribute, publish for free access, or re-list the model's source file,
          whether original or modified, on another platform.
        </p>
      </Section>

      <Section title="Article 9 — Designer obligations">
        <p>
          Each Designer warrants that they hold the necessary rights to the models they publish, and
          agrees not to publish infringing content, content protected by a third party without
          authorization, or content contrary to law. EzeeCAD reserves the right to remove any reported or
          suspected infringing model without notice.
        </p>
      </Section>

      <Section title="Article 10 — Platform role and liability">
        <p>
          EzeeCAD acts as a technical intermediary between Designers and Customers. The Platform
          moderates listings but does not guarantee exhaustive review of every uploaded file. EzeeCAD's
          liability shall not exceed the amount of the relevant transaction, except in cases of proven
          fault on its part.
        </p>
      </Section>

      <Section title="Article 11 — Account suspension and termination">
        <p>
          EzeeCAD may suspend or terminate any account in the event of a breach of these Terms, fraud, or
          misuse of the Platform, without prejudice to any further legal action.
        </p>
      </Section>

      <Section title="Article 12 — Governing law and disputes">
        <p>
          These Terms are governed by the law applicable at {COMPANY_PLACEHOLDER_EN}'s place of
          establishment. In the event of a dispute, an amicable solution will be sought as a priority
          before any legal action before the competent courts.
        </p>
      </Section>

      <Section title="Article 13 — Contact">
        <p>
          For any question regarding these Terms, Users may contact EzeeCAD via the{' '}
          <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
            Contact
          </a>{' '}
          page or at [contact email to be completed].
        </p>
      </Section>

      <p className="text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-800">
        This document is provided as a standard template for a digital-content marketplace. It does not
        constitute legal advice and should be reviewed by a legal professional before final publication,
        particularly regarding the company's exact registration, applicable taxation, and local legal
        compliance.
      </p>
    </>
  );
}
