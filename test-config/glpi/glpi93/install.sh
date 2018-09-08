#!/bin/sh
BASEDIR = $PWD
cp test-config/glpi/glpi93/add_data.php /usr/local/www/nginx/talaos_backends/glpi9.3/scripts/
cd /usr/local/www/nginx/talaos_backends/glpi9.3/scripts/
# php cliinstall.php
sudo php cliinstall.php --force --db talaos_backends_glpi93 -u root -p monpass
sudo php add_data.php
cd $BASEDIR
