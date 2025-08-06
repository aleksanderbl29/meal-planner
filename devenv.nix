{
  pkgs,
  lib,
  config,
  inputs,
  ...
}: {
  # https://devenv.sh/packages/
  packages = with pkgs; [
    git
  ];

  env = {
  };

  dotenv = {
    enable = true;
  };

  cachix.enable = true;

  difftastic.enable = true;

  languages = {
    javascript = {
      enable = true;
      npm = {
        enable = true;
        install.enable = false; # Installs all npm dependencies when devenv is started
      };
                        pnpm.enable = true;
    };
    typescript = {
      enable = true;
    };
  };

}
