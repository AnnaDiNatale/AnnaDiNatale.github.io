<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['recaptcha_response'])) {
    
    console.log("On rentre!");

    // Build POST request:
    $recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify';
    $recaptcha_secret = '6LfnbZUaAAAAAL_ZihPrFoTALeyD0dPzb2TkWGn3';
    $recaptcha_response = $_POST['recaptcha_response'];

    // Make and decode POST request:
    $recaptcha = file_get_contents($recaptcha_url . '?secret=' . $recaptcha_secret . '&response=' . $recaptcha_response);
    $recaptcha = json_decode($recaptcha);
    
    header('Content-type: application/json');
    
    console.log($recaptcha);
    
    echo $recaptcha;

    // Take action based on the score returned:
    //if ($recaptcha->score >= 0.5) {
        // Verified - send email
    //} else {
        // Not verified - show form error
    //}

} ?>
