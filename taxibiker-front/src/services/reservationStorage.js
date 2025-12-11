// Service pour sauvegarder et restaurer les données de réservation
class ReservationStorageService {
  constructor() {
    this.storageKey = "taxibiker_reservation_draft";
  }

  // Sauvegarder les données de réservation
  saveReservationData(data) {
    try {
      const reservationData = {
        tripType: data.tripType,
        date: data.date ? data.date.toISOString() : null,
        hour: data.hour,
        pickupAddress: data.pickupAddress,
        dropAddress: data.dropAddress,
        stopChecked: data.stopChecked,
        stopAddress: data.stopAddress,
        bagage: data.bagage,
        transportPickup: data.transportPickup,
        transportDrop: data.transportDrop,
        pickupTransportRef: data.pickupTransportRef,
        dropTransportRef: data.dropTransportRef,
        duration: data.duration,
        paymentMethod: data.paymentMethod,
        // Sauvegarder aussi les coordonnées si disponibles
        pickupLocation: data.pickupLocation,
        dropLocation: data.dropLocation,
        stopLocation: data.stopLocation,
        // Timestamp pour éviter les données trop anciennes
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(this.storageKey, JSON.stringify(reservationData));
      console.log("Données de réservation sauvegardées");
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des données de réservation:",
        error
      );
    }
  }

  // Restaurer les données de réservation
  getReservationData() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (!savedData) return null;

      const data = JSON.parse(savedData);

      // Vérifier si les données ne sont pas trop anciennes (24h max)
      const savedAt = new Date(data.savedAt);
      const now = new Date();
      const hoursDiff = (now - savedAt) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        this.clearReservationData();
        return null;
      }

      // Convertir la date string en objet Date
      if (data.date) {
        data.date = new Date(data.date);
      }

      console.log("Données de réservation restaurées");
      return data;
    } catch (error) {
      console.error(
        "Erreur lors de la restauration des données de réservation:",
        error
      );
      return null;
    }
  }

  // Supprimer les données sauvegardées
  clearReservationData() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log("Données de réservation supprimées");
    } catch (error) {
      console.error(
        "Erreur lors de la suppression des données de réservation:",
        error
      );
    }
  }

  // Vérifier s'il y a des données sauvegardées
  hasReservationData() {
    return localStorage.getItem(this.storageKey) !== null;
  }

  // Sauvegarder l'URL de redirection après connexion
  saveRedirectUrl(url) {
    try {
      localStorage.setItem("taxibiker_redirect_after_login", url);
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde de l'URL de redirection:",
        error
      );
    }
  }

  // Récupérer et supprimer l'URL de redirection
  getAndClearRedirectUrl() {
    try {
      const url = localStorage.getItem("taxibiker_redirect_after_login");
      if (url) {
        localStorage.removeItem("taxibiker_redirect_after_login");
      }
      return url;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'URL de redirection:",
        error
      );
      return null;
    }
  }
}

export default new ReservationStorageService();
