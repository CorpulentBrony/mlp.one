<?php
	class Cookie implements \JsonSerializable {
		const COOKIE_NAME = "mlpodcast-manager";
		public $id = "";
		public $salt = "";
		public $user = "";

		// returns false if no session or cookie set; otherwise, returns the cookie
		public static function getSession() {
			if (isset($_SESSION[self::COOKIE_NAME]) && !empty($_SESSION[self::COOKIE_NAME]->salt))
				return $_SESSION[self::COOKIE_NAME];
			elseif (!empty($_COOKIE[self::COOKIE_NAME]))
				return self::jsonUnserialize($_COOKIE[self::COOKIE_NAME]);
			return false;
		}

		public static function invalidate(): void {
			unset($_SESSION[self::COOKIE_NAME]);
			setcookie(self::COOKIE_NAME, "", time() - 3600);
		}

		public static function jsonUnserialize(string $json): self {
			$decoded = json_decode($json);
			return new self($decoded->id, (!empty($decoded->salt)) ? base64_decode($decoded->salt) : "", $decoded->user);
		}

		public function __construct(string $id, string $salt, string $user) {
			$this->id = $id;
			$this->salt = $salt;
			$this->user = $user;
		}

		public function isValid(): bool {
			$pdo = new \PDO(...PDO_ARGS);
			$command = $pdo->prepare("select Salt from Users where GoogleId = ?;");
			$command->execute([$this->id]);
			$isCookieValid = $command->fetch(\PDO::FETCH_NUM)[0] === $this->salt;
			
			if (!$isCookieValid)
				self::invalidate();
			return $isCookieValid;
		}

		public function jsonSerialize() {
			$result = new \stdClass();
			$result->id = $this->id;
			$result->salt = base64_encode($this->salt);
			$result->user = $this->user;
			return $result;
		}

		public function setSession(): void { $_SESSION[self::COOKIE_NAME] = $this; }
	}
?>