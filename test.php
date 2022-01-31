<!DOCTYPE html>
<html>

<head>
    <meta charset="utf8" />
    <title>PHP test</title>
    <link rel="stylesheet" href="style/css/main.css" />
</head>

<body class="test-php">
    <form class="test-php-form" name="file_get_contents" method="post">
        <label class="test-php-form__label" for="link"> Link to JSON:</label>
        <?php if (isset($_POST['link'])) : ?>
        <input class="test-php-form__link" type="text" name="link" id="link"
            value="<?php echo $_POST['link'] ?>" />
        <?php else : ?>
        <input class="test-php-form__link" type="text" name="link" id="link"
            value="https://m.catcasino.com/content/en/wp-json/wp/v2/pages?_fields=acf,id,date,slug,title,content,image,_embedded,_links&context=view&_embed=1&slug=terms-and-conditions" />
        <?php endif ?>
        <button class="test-php-form__button" type="submit">Get</button>
    </form>
    <?php if (isset($_POST['link'])) : ?>
    <?php
            $link = $_POST['link'];
            $homepage = file_get_contents($link);
        ?>
    <textarea class="test-php-response"><?php echo $homepage; ?></textarea>
    <?php endif ?>
</body>

</html>
