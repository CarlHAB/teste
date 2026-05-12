import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.util.Scanner;

public class Game {

    static String JAVA_EXE = "C:\\Program Files\\Eclipse Adoptium\\jdk-25.0.3.9-hotspot\\bin\\java.exe";

    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        Scanner scanner = new Scanner(System.in);

        System.out.println("🎮 Jogo: O que você prefere?\n");

        while (true) {
            // busca pergunta do servidor Node
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:3000/pergunta"))
                .GET()
                .build();

            HttpResponse<String> response = client.send(
                request,
                HttpResponse.BodyHandlers.ofString()
            );

            // parse manual do JSON
            String body = response.body();
            String opcao1 = extrairValor(body, "opcao1");
            String opcao2 = extrairValor(body, "opcao2");

            System.out.println("\n👉 O que você prefere?\n");
            System.out.println("1 - " + opcao1);
            System.out.println("2 - " + opcao2);
            System.out.print("\nEscolha (1/2) ou 'q' pra sair: ");

            String answer = scanner.nextLine().trim();

            if (answer.equalsIgnoreCase("q")) {
                System.out.println("\n👋 Valeu por jogar!");
                break;
            } else if (answer.equals("1") || answer.equals("2")) {
                System.out.println("🔥 Boa escolha!");
            } else {
                System.out.println("❌ Escolha inválida!");
            }
        }

        scanner.close();
    }

    // extrai valor do JSON sem biblioteca externa
    static String extrairValor(String json, String chave) {
        String busca = "\"" + chave + "\":\"";
        int inicio = json.indexOf(busca) + busca.length();
        int fim = json.indexOf("\"", inicio);
        return json.substring(inicio, fim);
    }
}