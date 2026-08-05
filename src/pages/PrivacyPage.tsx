import { useLang } from '@/context/LangContext';
import LegalLayout, { Section } from '@/components/LegalLayout';

const COMPANY_PLACEHOLDER_FR = '[Raison sociale / nom de l\'entreprise à compléter]';
const COMPANY_PLACEHOLDER_EN = '[Company name to be completed]';

export default function PrivacyPage() {
  const { lang } = useLang();
  const isEn = lang === 'en';

  return (
    <LegalLayout
      title={isEn ? 'Privacy Policy' : 'Politique de Confidentialité'}
      lastUpdated={isEn ? 'Last updated: August 2026' : 'Dernière mise à jour : Août 2026'}
      arabicNotice="النسخة العربية من سياسة الخصوصية قيد الإعداد. المحتوى أدناه متوفر حاليًا باللغتين الفرنسية والإنجليزية."
    >
      {isEn ? <PrivacyEn /> : <PrivacyFr />}
    </LegalLayout>
  );
}

function PrivacyFr() {
  return (
    <>
      <Section title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données personnelles collectées sur EzeeCAD est{' '}
          {COMPANY_PLACEHOLDER_FR}, joignable via la page{' '}
          <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
            Contact
          </a>{' '}
          ou à l'adresse [email de contact à compléter].
        </p>
      </Section>

      <Section title="2. Données collectées">
        <p>
          Dans le cadre de l'utilisation de la Plateforme, nous collectons :
        </p>
        <p>
          — <strong>Données de compte</strong> : nom complet, adresse e-mail, mot de passe (stocké de
          façon chiffrée), rôle (client/designer).<br />
          — <strong>Données d'usage</strong> : modèles consultés, achetés ou publiés, téléchargements,
          favoris.<br />
          — <strong>Données de transaction</strong> : historique des commandes et montants. Les données
          bancaires (numéro de carte, etc.) ne sont jamais collectées ni stockées par EzeeCAD : elles sont
          traitées exclusivement par notre prestataire de paiement, Chargily.<br />
          — <strong>Données techniques</strong> : adresse IP, type de navigateur, journaux de connexion,
          à des fins de sécurité et de prévention de la fraude.
        </p>
      </Section>

      <Section title="3. Finalités du traitement">
        <p>
          Les données collectées sont utilisées pour : créer et gérer le compte utilisateur, traiter les
          commandes et paiements, permettre le téléchargement des modèles achetés, assurer la sécurité de
          la Plateforme, répondre aux demandes envoyées via la page Contact, et améliorer le service.
        </p>
      </Section>

      <Section title="4. Base légale">
        <p>
          Le traitement des données repose sur l'exécution du contrat liant l'Utilisateur à EzeeCAD (achat
          et livraison de modèles), le respect d'obligations légales (comptabilité, lutte anti-fraude), et
          l'intérêt légitime d'EzeeCAD à sécuriser et améliorer la Plateforme.
        </p>
      </Section>

      <Section title="5. Partage des données">
        <p>
          Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :
        </p>
        <p>
          — <strong>Supabase</strong> (hébergement de la base de données, authentification et stockage des
          fichiers) ;<br />
          — <strong>Chargily</strong> (traitement sécurisé des paiements) ;<br />
          — <strong>Vercel</strong> (hébergement de l'application) ;<br />
          — les autorités compétentes, si la loi l'exige.
        </p>
      </Section>

      <Section title="6. Durée de conservation">
        <p>
          Les données de compte sont conservées tant que le compte est actif. En cas de suppression du
          compte, les données sont supprimées ou anonymisées dans un délai raisonnable, sous réserve des
          obligations légales de conservation (notamment comptables).
        </p>
      </Section>

      <Section title="7. Vos droits">
        <p>
          Conformément à la réglementation applicable en matière de protection des données personnelles,
          vous disposez d'un droit d'accès, de rectification, de suppression, d'opposition et de
          limitation du traitement de vos données. Vous pouvez exercer ces droits en nous contactant via
          la page{' '}
          <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
            Contact
          </a>.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          EzeeCAD utilise des cookies techniques strictement nécessaires au fonctionnement de la
          Plateforme (maintien de la session, préférence de langue et de thème). Aucun cookie publicitaire
          ou de suivi tiers n'est utilisé à ce jour.
        </p>
      </Section>

      <Section title="9. Sécurité">
        <p>
          Des mesures techniques et organisationnelles raisonnables sont mises en œuvre pour protéger vos
          données contre l'accès non autorisé, la perte ou l'altération (authentification sécurisée,
          chiffrement des mots de passe, accès restreint aux données via des règles de sécurité au niveau
          des lignes).
        </p>
      </Section>

      <Section title="10. Modification de la politique">
        <p>
          La présente politique peut être mise à jour. La date de dernière mise à jour figure en haut de
          cette page. Nous invitons les Utilisateurs à la consulter régulièrement.
        </p>
      </Section>

      <p className="text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-800">
        Ce document est fourni à titre de modèle standard. Il ne constitue pas un avis juridique et
        gagnera à être relu par un professionnel du droit, notamment pour s'assurer de sa conformité avec
        la réglementation locale applicable à {COMPANY_PLACEHOLDER_FR}.
      </p>
    </>
  );
}

function PrivacyEn() {
  return (
    <>
      <Section title="1. Data controller">
        <p>
          The data controller for personal data collected on EzeeCAD is {COMPANY_PLACEHOLDER_EN},
          reachable via the{' '}
          <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
            Contact
          </a>{' '}
          page or at [contact email to be completed].
        </p>
      </Section>

      <Section title="2. Data we collect">
        <p>As part of using the Platform, we collect:</p>
        <p>
          — <strong>Account data</strong>: full name, email address, password (stored encrypted), role
          (customer/designer).<br />
          — <strong>Usage data</strong>: models viewed, purchased or published, downloads, favorites.<br />
          — <strong>Transaction data</strong>: order history and amounts. Banking data (card number,
          etc.) is never collected or stored by EzeeCAD: it is processed exclusively by our payment
          provider, Chargily.<br />
          — <strong>Technical data</strong>: IP address, browser type, connection logs, for security and
          fraud-prevention purposes.
        </p>
      </Section>

      <Section title="3. Purposes of processing">
        <p>
          Collected data is used to: create and manage the user account, process orders and payments,
          enable download of purchased models, secure the Platform, respond to requests submitted via the
          Contact page, and improve the service.
        </p>
      </Section>

      <Section title="4. Legal basis">
        <p>
          Data processing is based on the performance of the contract between the User and EzeeCAD
          (purchase and delivery of models), compliance with legal obligations (accounting, fraud
          prevention), and EzeeCAD's legitimate interest in securing and improving the Platform.
        </p>
      </Section>

      <Section title="5. Data sharing">
        <p>Your data is never sold to third parties. It may be shared with:</p>
        <p>
          — <strong>Supabase</strong> (database hosting, authentication and file storage);<br />
          — <strong>Chargily</strong> (secure payment processing);<br />
          — <strong>Vercel</strong> (application hosting);<br />
          — competent authorities, where required by law.
        </p>
      </Section>

      <Section title="6. Retention period">
        <p>
          Account data is kept for as long as the account remains active. Upon account deletion, data is
          deleted or anonymized within a reasonable timeframe, subject to legal retention obligations
          (notably accounting).
        </p>
      </Section>

      <Section title="7. Your rights">
        <p>
          Subject to applicable data-protection regulations, you have the right to access, rectify,
          delete, object to, and restrict the processing of your data. You may exercise these rights by
          contacting us via the{' '}
          <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
            Contact
          </a>{' '}
          page.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          EzeeCAD uses technical cookies strictly necessary for the Platform to function (session
          persistence, language and theme preference). No advertising or third-party tracking cookies are
          currently used.
        </p>
      </Section>

      <Section title="9. Security">
        <p>
          Reasonable technical and organizational measures are implemented to protect your data against
          unauthorized access, loss, or alteration (secure authentication, password encryption, data
          access restricted via row-level security rules).
        </p>
      </Section>

      <Section title="10. Changes to this policy">
        <p>
          This policy may be updated from time to time. The last update date appears at the top of this
          page. Users are encouraged to review it periodically.
        </p>
      </Section>

      <p className="text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-200 dark:border-slate-800">
        This document is provided as a standard template. It does not constitute legal advice and should
        be reviewed by a legal professional to ensure compliance with the local regulations applicable to
        {' '}{COMPANY_PLACEHOLDER_EN}.
      </p>
    </>
  );
}
