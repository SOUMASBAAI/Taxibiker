<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $firstName = null;

    #[ORM\Column(length: 100)]
    private ?string $LastName = null;

    #[ORM\Column(length: 150)]
    private ?string $email = null;

    #[ORM\Column(length: 100)]
    private ?string $phoneNumber = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $monthlyCreditEnabled = false;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, options: ['default' => '0.00'])]
    private string $currentCredit = '0.00';

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->LastName;
    }

    public function setLastName(string $LastName): static
    {
        $this->LastName = $LastName;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getPhoneNumber(): ?string
    {
        return $this->phoneNumber;
    }

    public function setPhoneNumber(string $phoneNumber): static
    {
        $this->phoneNumber = $phoneNumber;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        if (!in_array('ROLE_USER', $roles, true)) {
            $roles[] = 'ROLE_USER';
        }
        return $roles;
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) ($this->email ?? '');
    }

    public function eraseCredentials(): void
    {
        // If we had temporary, sensitive data on the user, clear it here
        // e.g. $this->plainPassword = null;
    }

    public function isMonthlyCreditEnabled(): bool
    {
        return $this->monthlyCreditEnabled;
    }

    public function setMonthlyCreditEnabled(bool $monthlyCreditEnabled): static
    {
        $this->monthlyCreditEnabled = $monthlyCreditEnabled;

        return $this;
    }

    public function getCurrentCredit(): string
    {
        return $this->currentCredit;
    }

    public function setCurrentCredit(string $currentCredit): static
    {
        $this->currentCredit = $currentCredit;

        return $this;
    }

    public function addToCredit(string $amount): static
    {
        $this->currentCredit = bcadd($this->currentCredit, $amount, 2);

        return $this;
    }

    public function resetCredit(): static
    {
        $this->currentCredit = '0.00';

        return $this;
    }
}
