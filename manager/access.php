<?php
	require_once "header.php";

	(function (): void {
		function sendMessage(string $error = "", bool $isValid = false): void {
			echo json_encode(["error" => $error, "isValid" => $isValid], JSON_FORCE_OBJECT);

			if ($isValid === false) {
				Cookie::invalidate();
				die;
			}
		}

		$credential = json_decode($_POST["credential"]);
		header("Content-Type: application/json");

		if (!($credential && $credential->idToken))
			sendMessage("Invalid credential or no ID token received in request.  Please try again.");
		$client = new \Google_Client();
		$client->setAuthConfig("client_secrets.json");
		$data = $client->verifyIdToken($credential->idToken);

		if ($data) {
			$pdo = new \PDO(...PDO_ARGS);
			$command = $pdo->prepare("select count(*) as NumUsers from Users where GoogleId = ?;");
			$command->execute([$data["sub"]]);

			if ($command->fetchAll(\PDO::FETCH_COLUMN, 0)[0] !== "1")
				sendMessage("Google user {$credential->displayName} is not authorized to access this application.  Please contact the administrator if you believe this is in error.");
			$salt = random_bytes(16);
			$command = $pdo->prepare("update Users set Salt = ? where GoogleId = ?;");
			$command->execute([$salt, $data["sub"]]);
			$cookie = new Cookie($data["sub"], $salt, $credential->displayName);
			$cookie->setSession();
			sendMessage("", true);
		} else
			sendMessage("Google token did not pass validation, are you sure you are who you say you are?  Make sure and then try again.");
	})();
?>