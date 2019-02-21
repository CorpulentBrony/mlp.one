<?php
	namespace Mlp;

	abstract class DatabaseObject /*implements \Serializable*/ {
		public abstract function finalize(): DatabaseObject;
	}
?>