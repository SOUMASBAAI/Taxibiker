<?php

$bundles = [
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    Doctrine\Bundle\DoctrineBundle\DoctrineBundle::class => ['all' => true],
    Doctrine\Bundle\MigrationsBundle\DoctrineMigrationsBundle::class => ['all' => true],
    Symfony\Bundle\SecurityBundle\SecurityBundle::class => ['all' => true],
    Symfony\Bundle\TwigBundle\TwigBundle::class => ['all' => true],
    Nelmio\CorsBundle\NelmioCorsBundle::class => ['all' => true],
    ApiPlatform\Symfony\Bundle\ApiPlatformBundle::class => ['all' => true],
    Lexik\Bundle\JWTAuthenticationBundle\LexikJWTAuthenticationBundle::class => ['all' => true],
];

// Bundles uniquement en dev/test, chargés uniquement s'ils sont disponibles
if (class_exists(\Symfony\Bundle\MakerBundle\MakerBundle::class)) {
    $bundles[\Symfony\Bundle\MakerBundle\MakerBundle::class] = ['dev' => true];
}

if (class_exists(\Doctrine\Bundle\FixturesBundle\DoctrineFixturesBundle::class)) {
    $bundles[\Doctrine\Bundle\FixturesBundle\DoctrineFixturesBundle::class] = ['dev' => true, 'test' => true];
}

return $bundles;
