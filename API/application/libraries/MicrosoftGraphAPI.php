<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require 'vendor/autoload.php'; // Ensure this path is correct
use GuzzleHttp\Client;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use League\OAuth2\Client\Provider\GenericProvider;
use League\OAuth2\Client\Token\AccessToken;
use League\OAuth2\Client\Token\AccessTokenInterface;
class MicrosoftGraphAPI {

    public $clientId;
    public $clientSecret;
    public $tenantId;
    public $accessTokenDB;
    public $accessToken;
    public $graph;
    public $redirect_uri ="";
    public $provider;
    
    public function __construct() {
        // Load the configuration from a config file or environment variables
        $this->redirect_uri = 'http://localhost/idac_app/API/onedriveCallBack';
        $this->CI = &get_instance();
		$this->CI->load->model('CommonModel');

        $this->clientId = '';
        $this->clientSecret = '';
        $this->tenantId = 'common';
        $where = array("adminID"=>"1");
        $res = $this->CI->CommonModel->getMasterDetails("admin","one_drive_access_token",$where);
        $this->accessTokenDB = $res[0]->one_drive_access_token;

        $this->provider = new GenericProvider([
			'clientId'                => $this->clientId,
			'clientSecret'            => $this->clientSecret,
			'redirectUri'             => $this->redirect_uri,
			'urlAuthorize'            => "https://login.microsoftonline.com/".$this->tenantId."/oauth2/v2.0/authorize",
            'urlAccessToken'          =>"https://login.microsoftonline.com/".$this->tenantId."/oauth2/v2.0/token",
			'urlResourceOwnerDetails' => '',
			'scopes'                  => 'openid profile offline_access User.Read Files.ReadWrite.All',
		]);


        // Initialize Graph client
        //$this->graph = new \Microsoft\Graph\Graph();
        //$this->authenticate();
    }
    public function getAccessToken(){

        $tokenArray = json_decode($this->accessTokenDB, true);
        $accessToken = new AccessToken($tokenArray);
        
        // Check if the token has expired
        if ($accessToken->hasExpired()) {
            try {
                // Refresh the token
                $newAccessToken = $provider->getAccessToken('refresh_token', [
                    'refresh_token' => $accessToken->getRefreshToken()
                ]);
                // Save the new token
                //file_put_contents('token.json', json_encode($newAccessToken->jsonSerialize()));
                $data = array("one_drive_access_token"=>json_encode($newAccessToken->jsonSerialize()));
                $where = array("adminID"=>"1");
                $res = $this->CI->CommonModel->updateMasterDetails("admin",$data,$where);
                $this->accessToken = $newAccessToken->getAccessToken();
               // return $accessToken;
            } catch (Exception $e) {
                echo "Failed to refresh access token: " . $e->getMessage();
                return null;
            }
        } else {
            return $this->accessToken = $accessToken->getToken();
        }
    }
    public function authenticate() {
        
       if (!isset($_GET['code'])) {
			// If we don't have an authorization code then get one
			$authUrl = $this->provider->getAuthorizationUrl();
			$_SESSION['oauth2state'] = $this->provider->getState();
			header('Location: ' . $authUrl);
			exit;
		
		} elseif (empty($_GET['state']) || ($_GET['state'] !== $_SESSION['oauth2state'])) {
			// Check given state against previously stored one to mitigate CSRF attack
			unset($_SESSION['oauth2state']);
			exit('Invalid state');
		
		} else {
			// Try to get an access token (using the authorization code grant)
			try {
				$token = $this->provider->getAccessToken('authorization_code', [
					'code' => $_GET['code']
				]);
                $data = array("one_drive_access_token"=>json_encode($token->jsonSerialize()));
                $where = array("adminID"=>"1");
                $this->accessToken = $token;
                $res = $this->CI->CommonModel->updateMasterDetails("admin",$data,$where);

			} catch (IdentityProviderException $e) {
				exit('Failed to get access token: ' . $e->getMessage());
			}
		}

       
    }
    public function getFileList(){
        try {
            $this->getAccessToken();
            // Access token retrieved successfully
            $client = new Client();
            // Make a GET request to the Microsoft Graph API to get the list of files
            //$url = 'https://graph.microsoft.com/v1.0/me/drive/special/test';
            //$url = 'https://graph.microsoft.com/v1.0/me/drive/root/children';
            
            //$url = 'https://graph.microsoft.com/v1.0/me/drives';
            $url = 'https://graph.microsoft.com/v1.0/drives/b5c78af7d85eda15/items/B5C78AF7D85EDA15!1113/children';
            $response = $client->request('GET', $url, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->accessToken,
                    'Accept' => 'application/json'
                ]
            ]);
            // Decode the JSON response
            $data = json_decode($response->getBody(), true);
            print "<pre>";
            print_r($data);
            // List the files
            foreach ($data['value'] as $file) {
                echo "File Name: " . $file['name'] . "<br/>";
                echo "File ID: " . $file['id'] .  "<br/>";
                echo "\n";
            }
        } catch (IdentityProviderException $e) {
            // Failed to get the access token
            echo "Failed to get access token: " . $e->getMessage();
        } catch (Exception $e) {
            // Other exceptions
            echo "Error: " . $e->getMessage();
        }
    }
    public function getFolderIDByName($folderName){
        try {
            $this->getAccessToken();
            // Access token retrieved successfully
            $client = new Client();
            
            // Folder name you want to retrieve the ID for
            
            // Make a GET request to the Microsoft Graph API to search for the folder by name
            $response = $client->request('GET', 'https://graph.microsoft.com/v1.0/drives/b5c78af7d85eda15/root/search(q=\'' . urlencode($folderName) . '\')', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->accessToken,
                    'Accept' => 'application/json'
                ]
            ]);
            
            // Decode the JSON response
            $data = json_decode($response->getBody(), true);
            
            // Check if the folder was found
            if (!empty($data['value'])) {
                // Extract the folder ID from the search results
                $folderId = $data['value'][0]['id'];
                
                echo "Folder ID: " . $folderId . "\n";
            } else {
                echo "Folder not found.\n";
            }
        } catch (Exception $e) {
            // Other exceptions
            echo "Error: " . $e->getMessage();
        }
    }
    public function createFolder($folderName){
        try {
            $this->getAccessToken();
            // Access token retrieved successfully
            $client = new Client();
            
            // Define the name and parent directory ID for the new folder
            //$folderName = "Project_1001"; // Replace with the desired folder name
            $parentDirectoryId = "B5C78AF7D85EDA15!1113"; // Replace with the ID of the parent directory where you want to create the folder
            
            // JSON payload for creating the folder
            $payload = [
                "name" => $folderName,
                "folder" => ["@odata.type"=>"microsoft.graph.folder"], // This indicates it's a folder
                "@microsoft.graph.conflictBehavior" => "fail", // Fail if a folder with the same name already exists
                "@microsoft.graph.downloadUrl"=> "url",
            ];
            
            // Make a POST request to the Microsoft Graph API to create the folder
            $response = $client->request('POST', 'https://graph.microsoft.com/v1.0/drives/b5c78af7d85eda15/items/'.$parentDirectoryId.'/children', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->accessToken,
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json'
                ],
                'json' => $payload
            ]);
            
            // Decode the JSON response
            $data = json_decode($response->getBody(), true);
            print_r($data); 
            // Get the ID of the newly created folder
            $folderId = $data['id'];
            
            echo "Folder created successfully. Folder ID: " . $folderId . "\n";
        } catch (Exception $e) {
            $this->erroNotifiyToUser($e);
        }
    }
    private function erroNotifiyToUser($e){
            // You can add more specific error handling based on exception type or message
            if ($e instanceof GuzzleHttp\Exception\ClientException) {
                $response = $e->getResponse();
                $statusCode = $response->getStatusCode();
                $responseBody = json_decode($response->getBody(), true);
        
                echo "Client error ($statusCode): " . $responseBody['error']['message'] ?? $e->getMessage();
            } elseif ($e instanceof GuzzleHttp\Exception\ServerException) {
                echo "Server error: " . $e->getMessage();
            }else {
                echo "An unexpected error occurred: " . $e->getMessage();
            }
        }
}
?>
	
    