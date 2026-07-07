export class MusicalItem {
    id: number;
    title: string;
    artist: string;
    genre: string;
    image: string;
    type: string;
    // Acá guardo la URL de preview para reproducir fragmentos cortos.
    audioPreview: string;

    constructor(data: any) {
        // Acá tomo los datos crudos y los adapto al formato interno de mi app.
        this.id = data.id;

        this.title = data.title || data.name;
        this.artist = data.artist || "Independent Artist";
        this.genre = data.genre || "Unspecified Genre";
        this.image = data.image || "default-image.jpg";
        this.type = data.type;
        this.audioPreview = data.audioPreview || "";
    }

    // Acá devuelvo un texto resumido que me sirve para mostrar info en tarjetas.
    get summaryInfo(): string {
        return `${this.title} - ${this.artist} (${this.genre})`;
    }
}
