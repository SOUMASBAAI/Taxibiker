<?php

namespace App\Entity;

use App\Repository\FlatRateBookingRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FlatRateBookingRepository::class)]
class FlatRateBooking
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?\DateTime $date = null;

    #[ORM\Column(length: 255)]
    private ?string $departure = null;

    #[ORM\Column(length: 255)]
    private ?string $arrival = null;

    #[ORM\Column]
    private ?int $numberOfHours = null;

    #[ORM\Column]
    private ?bool $excessBaggage = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2)]
    private ?string $price = null;

    #[ORM\Column(length: 255)]
    private ?string $statut = null;

    #[ORM\ManyToOne(inversedBy: 'flatRateBookings')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $client = null;

    #[ORM\Column(length: 50, options: ['default' => 'immediate'])]
    private string $paymentMethod = 'immediate';

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?\DateTime
    {
        return $this->date;
    }

    public function setDate(\DateTime $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getDeparture(): ?string
    {
        return $this->departure;
    }

    public function setDeparture(string $departure): static
    {
        $this->departure = $departure;

        return $this;
    }

    public function getArrival(): ?string
    {
        return $this->arrival;
    }

    public function setArrival(string $arrival): static
    {
        $this->arrival = $arrival;

        return $this;
    }

    public function getNumberOfHours(): ?int
    {
        return $this->numberOfHours;
    }

    public function setNumberOfHours(int $numberOfHours): static
    {
        $this->numberOfHours = $numberOfHours;

        return $this;
    }

    public function isExcessBaggage(): ?bool
    {
        return $this->excessBaggage;
    }

    public function setExcessBaggage(bool $excessBaggage): static
    {
        $this->excessBaggage = $excessBaggage;

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

    public function getStatut(): ?string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getClient(): ?User
    {
        return $this->client;
    }

    public function setClient(?User $client): static
    {
        $this->client = $client;

        return $this;
    }

    public function getPaymentMethod(): string
    {
        return $this->paymentMethod;
    }

    public function setPaymentMethod(string $paymentMethod): static
    {
        $this->paymentMethod = $paymentMethod;

        return $this;
    }
}
