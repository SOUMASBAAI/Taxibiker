const Privacy = () => {
  return (
    <div className="bg-black min-h-screen max-w-6xl mx-auto px-6 py-16 text-gray-100 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold mb-10 text-orange-500">
        Politique de confidentialité
      </h1>

      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-orange-400">Qui sommes-nous ?</h2>
          <p>
            L’adresse de notre site est : <strong className="text-orange-400">https://taxibikerparis.fr</strong>.
            Le site Taxi Biker Paris est hébergé par <strong className="text-orange-400">PlanetHoster</strong>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-orange-400">Commentaires</h2>
          <p>
            Quand vous laissez un commentaire sur notre site, les données
            inscrites dans le formulaire de commentaire, mais aussi votre adresse
            IP et l’agent utilisateur de votre navigateur sont collectés pour nous
            aider à la détection des commentaires indésirables.
          </p>
          <p className="mt-2">
            Une chaîne anonymisée créée à partir de votre adresse e-mail
            (également appelée hash) peut être envoyée à un service tiers tel que
            <strong className="text-orange-400"> Gravatar</strong> afin de vérifier si vous utilisez ce dernier. Après
            validation de votre commentaire, votre photo de profil pourra être
            visible publiquement à côté de votre commentaire.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-orange-400">Médias</h2>
          <p>
            Si vous téléversez des images sur le site, nous vous conseillons
            d’éviter de téléverser des images contenant des données EXIF de
            coordonnées GPS. Les personnes visitant le site peuvent télécharger
            et extraire des données de localisation depuis ces images.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-orange-400">Cookies</h2>
          <p>
            Si vous déposez un commentaire sur notre site, il vous sera proposé
            d’enregistrer votre nom, adresse e-mail et site dans des cookies.
            Ces cookies expirent au bout d’un an.
          </p>
          <p className="mt-2">
            Si vous vous rendez sur la page de connexion, un cookie temporaire
            sera créé afin de déterminer si votre navigateur accepte les cookies.
          </p>
          <p className="mt-2">
            Lorsque vous vous connecterez, des cookies pourront enregistrer vos
            informations de connexion et vos préférences d’écran.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-orange-400">
            Contenu embarqué depuis d’autres sites
          </h2>
          <p>
            Les pages de ce site peuvent inclure des contenus intégrés (vidéos,
            images, articles). Le contenu intégré depuis d’autres sites se
            comporte de la même manière que si le visiteur se rendait sur cet
            autre site.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-orange-400">
            Les droits que vous avez sur vos données
          </h2>
          <p>
            Vous pouvez demander l’accès, la modification ou la suppression de
            vos données personnelles conformément au RGPD.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
