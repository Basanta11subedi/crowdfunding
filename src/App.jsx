// CrowdfundingApp.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';
import './App.css';


function CrowdfundingApp() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    evidence: '',
    fundingGoal: '',
    duration: ''
  });

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setAccount(accounts[0]);
        setupContract();
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Setup Contract
  const setupContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const crowdfundingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(crowdfundingContract);
      await loadCampaigns(crowdfundingContract);
    } catch (error) {
      console.error('Error setting up contract:', error);
    }
  };

  // Load Campaigns
  const loadCampaigns = async (contractInstance) => {
    try {
      const campaignCount = await contractInstance.campaignCount();
      const campaignPromises = [];
      
      for (let i = 0; i < campaignCount; i++) {
        campaignPromises.push(contractInstance.getCampaignDetails(i));
      }
      
      const campaignData = await Promise.all(campaignPromises);
      setCampaigns(campaignData.map((campaign, index) => ({
        id: index,
        creator: campaign[0],
        title: campaign[1],
        description: campaign[2],
        evidence: campaign[3],
        fundingGoal: ethers.utils.formatEther(campaign[4]),
        deadline: new Date(campaign[5] * 1000),
        amountRaised: ethers.utils.formatEther(campaign[6]),
        isCompleted: campaign[7]
      })));
      setLoading(false);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setLoading(false);
    }
  };

  // Create Campaign
  const createCampaign = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.createCampaign(
        formData.title,
        formData.description,
        formData.evidence,
        ethers.utils.parseEther(formData.fundingGoal),
        Number(formData.duration) * 86400 // Convert days to seconds
      );
      await tx.wait();
      await loadCampaigns(contract);
      setFormData({
        title: '',
        description: '',
        evidence: '',
        fundingGoal: '',
        duration: ''
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  // Contribute to Campaign
  const contribute = async (campaignId, amount) => {
    try {
      const tx = await contract.contribute(campaignId, {
        value: ethers.utils.parseEther(amount)
      });
      await tx.wait();
      await loadCampaigns(contract);
    } catch (error) {
      console.error('Error contributing:', error);
    }
  };

  // Withdraw Funds
  const withdrawFunds = async (campaignId) => {
    try {
      const tx = await contract.withdrawFunds(campaignId);
      await tx.wait();
      await loadCampaigns(contract);
    } catch (error) {
      console.error('Error withdrawing funds:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-blue-950 to-gray-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 space-y-4 md:space-y-0 py-6 border-b border-indigo-500/20">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
              Blockchain Crowdfunding
            </h1>
            <p className="text-indigo-300 mt-2 text-lg max-w-2xl">Secure, transparent, and decentralized fundraising platform powered by blockchain technology</p>
          </div>
          {!account ? (
            <button
              onClick={connectWallet}
              className="group px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Connect Wallet</span>
            </button>
          ) : (
            <div className="px-6 py-3 bg-indigo-900/30 rounded-xl border border-indigo-500/30 backdrop-blur-lg shadow-lg shadow-indigo-500/10 flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 font-medium">Connected: </span>
              <span className="font-mono bg-indigo-800/50 px-3 py-1 rounded-lg text-indigo-200">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
          )}
        </header>
  
        {/* Create Campaign Form */}
        {account && (
          <div className="mb-16 p-8 rounded-2xl bg-indigo-900/10 backdrop-blur-lg border border-indigo-500/30 shadow-xl shadow-indigo-500/5">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 inline-flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create New Campaign
            </h2>
            <form onSubmit={createCampaign} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-indigo-300 mb-1 block">Campaign Title</label>
                  <input
                    type="text"
                    placeholder="Enter a memorable title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-indigo-300 mb-1 block">Evidence Link</label>
                  <input
                    type="text"
                    placeholder="URL to supporting documents"
                    value={formData.evidence}
                    onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder-indigo-600"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-indigo-300 mb-1 block">Campaign Description</label>
                <textarea
                  placeholder="Describe your campaign and its purpose"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all h-32 resize-none placeholder-indigo-600"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-indigo-300 mb-1 block">Funding Goal (POL)</label>
                  <input
                    type="number"
                    placeholder="Amount in POL"
                    value={formData.fundingGoal}
                    onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder-indigo-600"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-indigo-300 mb-1 block">Duration (days)</label>
                  <input
                    type="number"
                    placeholder="Campaign duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder-indigo-600"
                    min="1"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <span>Launch Campaign</span>
              </button>
            </form>
          </div>
        )}
  
        {/* Campaigns Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 inline-flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Active Campaigns
          </h2>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-4"></div>
              <p className="text-indigo-300 text-lg">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-20 h-20 text-indigo-400 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1m-4.242 4.243l-.707.707M12 21v-1m-4.243-4.243l-.707.707M3 12h1m4.241-4.242l.707-.707"></path>
              </svg>
              <p className="text-xl text-indigo-300 mb-2">No campaigns found</p>
              <p className="text-indigo-400/70">Create your first campaign to get started</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-6 rounded-2xl bg-gradient-to-b from-indigo-900/20 to-blue-900/10 backdrop-blur-lg border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group flex flex-col"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300 group-hover:from-indigo-200 group-hover:to-cyan-200 transition-all">{campaign.title}</h3>
                  <p className="text-indigo-200/80 mb-4 line-clamp-3">{campaign.description}</p>
                  
                  {campaign.evidence && (
                    <a 
                      href={campaign.evidence} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-all mb-4"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                      </svg>
                      View Evidence
                    </a>
                  )}
                </div>
                
                <div className="space-y-4 mb-6 flex-grow">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="px-4 py-3 rounded-lg bg-indigo-900/30 border border-indigo-500/20">
                      <p className="text-xs text-indigo-400 mb-1">Target</p>
                      <p className="text-lg font-bold text-cyan-300">{campaign.fundingGoal} POL</p>
                    </div>
                    <div className="px-4 py-3 rounded-lg bg-indigo-900/30 border border-indigo-500/20">
                      <p className="text-xs text-indigo-400 mb-1">Raised</p>
                      <p className="text-lg font-bold text-cyan-300">{campaign.amountRaised} POL</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-indigo-400">Progress ({Math.min(Math.round((parseFloat(campaign.amountRaised) / parseFloat(campaign.fundingGoal)) * 100), 100)}%)</span>
                      <span className="text-cyan-400 font-medium">{campaign.amountRaised}/{campaign.fundingGoal} POL</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-indigo-900/50 rounded-full h-3 p-0.5">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full transition-all relative"
                        style={{ width: `${Math.min((parseFloat(campaign.amountRaised) / parseFloat(campaign.fundingGoal)) * 100, 100)}%` }}
                      >
                        {(parseFloat(campaign.amountRaised) / parseFloat(campaign.fundingGoal)) >= 1 && (
                          <span className="absolute -right-1 -top-1 w-4 h-4 bg-cyan-500 rounded-full animate-ping opacity-75"></span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-indigo-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="text-sm text-indigo-300">
                        {campaign.deadline <= new Date() ? (
                          <span className="text-red-400">Ended {campaign.deadline.toLocaleDateString()}</span>
                        ) : (
                          <span>Ends {campaign.deadline.toLocaleDateString()}</span>
                        )}
                      </span>
                    </div>
                    {campaign.isCompleted && (
                      <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-medium rounded-md border border-emerald-500/30">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
  
                {!campaign.isCompleted && campaign.deadline > new Date() && (
                  <div className="space-y-3 pt-4 border-t border-indigo-500/20">
                    <input
                      type="number"
                      placeholder="Amount to contribute (POL)"
                      onChange={(e) => {
                        const amount = e.target.value;
                        const button = e.target.nextElementSibling;
                        if (button) {
                          button.onclick = () => contribute(campaign.id, amount);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-indigo-950/50 border border-indigo-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder-indigo-600"
                      min="0.001"
                      step="0.001"
                    />
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      <span>Contribute</span>
                    </button>
                  </div>
                )}
  
                {!campaign.isCompleted && 
                  (campaign.deadline <= new Date() || 
                  parseFloat(campaign.amountRaised) >= parseFloat(campaign.fundingGoal)) && 
                  campaign.creator.toLowerCase() === account?.toLowerCase() && (
                  <button
                    onClick={() => withdrawFunds(campaign.id)}
                    className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Withdraw Funds</span>
                  </button>
                )}
  
                {campaign.isCompleted && (
                  <div className="w-full mt-4 py-3 bg-emerald-900/20 rounded-lg text-emerald-400 font-medium text-center border border-emerald-500/30">
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Campaign Successfully Completed
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <footer className="mt-16 pt-8 pb-6 border-t border-indigo-500/20">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              App Made by Basanta Subedi
            </h2>
            <p className="text-indigo-400/60 mt-2 mb-4">Transparent blockchain crowdfunding for everyone</p>
            
            {/* Contact Links */}
            <div className="flex items-center space-x-6 mt-2">
              {/* Email */}
              <a 
                href="https://basanta11subedi@gmail.com" 
                className="text-indigo-300 hover:text-cyan-400 transition-colors flex items-center"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>Email</span>
              </a>
              
              {/* GitHub */}
              <a 
                href="https://github.com/Basanta11subedi/crowdfunding.git" 
                className="text-indigo-300 hover:text-cyan-400 transition-colors flex items-center"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                </svg>
                <span>GitHub</span>
              </a>
              
              {/* LinkedIn */}
              <a 
                href="www.linkedin.com/in/basanta-subedi-446825304" 
                className="text-indigo-300 hover:text-cyan-400 transition-colors flex items-center"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
            
            <p className="text-indigo-400/40 text-sm mt-6">© {new Date().getFullYear()} Blockchain Crowdfunding Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default CrowdfundingApp;