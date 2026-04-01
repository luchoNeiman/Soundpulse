export class MusicalItem {
    id: number;
    title: string;
    name: string; // Para manejar tanto álbumes como artistas
    artist: string;
    gender: string;
    image: string;
    type: string;
    audioPreview: string; // Nueva propiedad para la URL de la vista previa de audio

    constructor(data: any) {
        this.id = data.id;

        this.title = data.title;
        this.name = data.name;
        this.artist = data.artist || "Independent Artist";
        this.gender = data.gender || "Unspecified Genre";
        this.image = data.image || "default-image.jpg";
        this.type = data.type;
        this.audioPreview = data.audioPreview || ""; // Asignar la URL de la vista previa de audio
    }

    // Unifico los métodos en uno que sea descriptivo
    get summaryInfo(): string {
        return `${this.title} - ${this.artist} (${this.gender})`;
    }
}
