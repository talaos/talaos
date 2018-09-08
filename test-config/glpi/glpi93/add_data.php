<?php

include ('../inc/includes.php');

$computer     = new Computer();
$user         = new User();
$config       = new Config();
$userCategory = new UserCategory();
$userTitle    = new UserTitle();
$apiClient    = new APIClient();

// Create computers

$input = ['name' => 'test-PC1', 'entities_id' => 0];
$computer->add($input);

$input = ['name' => 'test-PC2', 'entities_id' => 0];
$computer->add($input);

$input = ['name' => 'test-PC3', 'entities_id' => 0];
$computer->add($input);

$input = ['name' => 'test-PC4', 'entities_id' => 0];
$computer->add($input);

// Add usercategory
$usercategories_id = $userCategory->add(['name' => 'Admins']);

// Add usertitle
$usertitles_id = $userTitle->add(['name' => 'Administrator']);


// Update glpi user
$user->getFromDBbyName('glpi');
$input = [
  'id'                => $user->fields['id'],
  'firstname'         => 'David',
  'realname'          => 'Durieux',
  'phone'             => '04.00.00.00.00',
  'mobile'            => '07.00.00.00.00',
  '_useremails'       => [ '-1' => 'root@root.com', '-2' => 'root2@foo.bar'],
  'usercategories_id' => $usercategories_id,
  'usertitles_id'     => $usertitles_id,
];
$user->update($input);

/*
picture: "4c/2_5b7ed50e2b34c.png",
*/


// Enable API
$config->setConfigurationValues('core', [
  'enable_api'                      => 1,
  'enable_api_login_credentials'    => 1,
  'enable_api_login_external_token' => 1,
]);

// Configure the API
$apiClient->getFromDB(1);
$input = [
  'id'           => $apiClient->fields['id'],
  'is_recursive' => 1,
  'is_active'    => 1,
  'app_token'    => 'aRpH7UQAd7z3j7sq0WF1atqRFtDLLfal1c9oyWD8'
];
$apiClient->update($input);


