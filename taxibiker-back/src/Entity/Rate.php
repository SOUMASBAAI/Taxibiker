<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Put;
use App\Repository\RateRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RateRepository::class)]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Put()
    ]
)]
class Rate
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2)]
    private ?string $nightRate = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2)]
    private ?string $weekendRate = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2)]
    private ?string $excessBaggage = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2)]
    private ?string $holyday = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2)]
    private ?string $tds = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2)]
    private ?string $stop = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2)]
    private ?string $kilometer = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNightRate(): ?string
    {
        return $this->nightRate;
    }

    public function setNightRate(string $nightRate): static
    {
        $this->nightRate = $nightRate;

        return $this;
    }

    public function getWeekendRate(): ?string
    {
        return $this->weekendRate;
    }

    public function setWeekendRate(string $weekendRate): static
    {
        $this->weekendRate = $weekendRate;

        return $this;
    }

    public function getExcessBaggage(): ?string
    {
        return $this->excessBaggage;
    }

    public function setExcessBaggage(string $excessBaggage): static
    {
        $this->excessBaggage = $excessBaggage;

        return $this;
    }

    public function getHolyday(): ?string
    {
        return $this->holyday;
    }

    public function setHolyday(string $holyday): static
    {
        $this->holyday = $holyday;

        return $this;
    }

    public function getTds(): ?string
    {
        return $this->tds;
    }

    public function setTds(string $tds): static
    {
        $this->tds = $tds;

        return $this;
    }

    public function getStop(): ?string
    {
        return $this->stop;
    }

    public function setStop(string $stop): static
    {
        $this->stop = $stop;

        return $this;
    }

    public function getKilometer(): ?string
    {
        return $this->kilometer;
    }

    public function setKilometer(string $kilometer): static
    {
        $this->kilometer = $kilometer;

        return $this;
    }
}
