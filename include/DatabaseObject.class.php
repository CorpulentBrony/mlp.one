<?php
	namespace Mlp;

	abstract class DatabaseObject {
		public abstract function finalize(): DatabaseObject;
	}
?>