<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\ZonePricingRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ZonePricingRepository::class)]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Put(),
        new Delete()
    ]
)]
class ZonePricing
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Zone::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Zone $fromZone = null;

    #[ORM\ManyToOne(targetEntity: Zone::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Zone $toZone = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $price = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $basePrice = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $pricePerKm = null;

    #[ORM\Column]
    private ?bool $isDistanceBased = false;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFromZone(): ?Zone
    {
        return $this->fromZone;
    }

    public function setFromZone(?Zone $fromZone): static
    {
        $this->fromZone = $fromZone;
        return $this;
    }

    public function getToZone(): ?Zone
    {
        return $this->toZone;
    }

    public function setToZone(?Zone $toZone): static
    {
        $this->toZone = $toZone;
        return $this;
    }

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(string $price): static
    {
        $this->price = $price;
        return $this;
    }

    public function getBasePrice(): ?string
    {
        return $this->basePrice;
    }

    public function setBasePrice(?string $basePrice): static
    {
        $this->basePrice = $basePrice;
        return $this;
    }

    public function getPricePerKm(): ?string
    {
        return $this->pricePerKm;
    }

    public function setPricePerKm(?string $pricePerKm): static
    {
        $this->pricePerKm = $pricePerKm;
        return $this;
    }

    public function getIsDistanceBased(): ?bool
    {
        return $this->isDistanceBased;
    }

    public function setIsDistanceBased(bool $isDistanceBased): static
    {
        $this->isDistanceBased = $isDistanceBased;
        return $this;
    }
}

